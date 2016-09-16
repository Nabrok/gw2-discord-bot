var
	async = require('async'),
	config = require('config'),
	db = require('../lib/db'),
	gw2 = require('../lib/gw2_api')
;

var guild_id = config.get('guild.id');
var guild_key = config.get('guild.key');

var open_codes = {}; // Codes we're currently expecting to see in an API key name

function requestAPIKey(user) {
	var code = Math.random().toString(36).toUpperCase().substr(2, 5);
	open_codes[user.id] = {
		code: code,
		user: user
	};
	user.sendMessage('Please reply with a key from https://acount.arena.net/applications - include the code **'+code+'** in the key name field.');
	// Remove code in 5 minutes
	setTimeout(function() { delete open_codes[user.id]; }, 5 * 60 * 1000);
}

function checkUserAccount(user, callback) {
	if (! callback) callback = function() {};
	var world_id = config.get('world.id');
	var world_role_name = config.get('world.role');
	var guild_role_name = config.get('guild.member_role');
	var bot = user.client;
	async.waterfall([
		function(next) { db.getUserKey(user.id, next) },
		function(key, next) { if (! key) return next(); gw2.request('/v2/account', key, next) },
	], function(err, account) {
		if (err) {
			console.log(err);
		}
		if (err && (err.message === 'endpoint requires authentication' || err.message === 'invalid key')) {
			console.log('removing user '+user.id);
			// Invalid/deleted key - remove everything
			async.parallel([
				function(next) { db.removeUser(user.id, next); },
				function(next) {
					if (! world_role_name) return next();
					async.each(bot.servers, function(s, next_server) {
						var world_role = s.roles.get('name', world_role_name);
						if (user.hasRole(world_role)) user.removeFrom(world_role, next_server)
						else next_server();
					}, next);
				}
			], function(err) {
				callback(null, false);
				if (guild_role_name) gw2.request('/v2/guild/'+guild_id+'/members', guild_key, null, { always_hook: true });
			});
			return;
		}
		if (! account) {
			callback(null, false);
			return;
		}
		var in_guild = (account.guilds.indexOf(guild_id) > -1);
		db.setUserAccount(user.id, account, function(err) {
			async.each(bot.servers, function(s, next_server) {
				async.parallel([
					function(next) {
						if (! world_role_name) return next();
						var world_role = s.roles.get('name', world_role_name);
						// Add or remove from guild world role
						if (account.world !== world_id && user.hasRole(world_role)) {
							user.removeFrom(world_role, next);
						}
						else if (account.world === world_id && ! user.hasRole(world_role)) {
							user.addTo(world_role, next);
						}
						else next();
					},
					function(next) {
						// Add or remove from member role
						if (! guild_role_name) return next();
						var guild_role = s.roles.get('name', guild_role_name);
						if (in_guild && ! user.hasRole(guild_role)) user.addTo(guild_role, next);
						else if (user.hasRole(guild_role) && ! in_guild) user.removeFrom(guild_role, next);
						else next();
					}
				], next_server);
			}, function(err) {
				// Update the member list
				if (guild_role_name) gw2.request('/v2/guild/'+guild_id+'/members', guild_key, null, { always_hook: true });
				callback(null, true);
			});
		});
	});
}

function messageReceived(message) {
	if (message.channel.isPrivate) {
		if (message.content === "link") {
			// User wants to change API key
			requestAPIKey(message.author);
		}
		if (open_codes[message.author.id]) {
			var oc = open_codes[message.author.id];
			// We're waiting on an API key for this user
			var match = message.content.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{20}-\w{4}-\w{4}-\w{4}-\w{12}/);
			if (match) {
				message.channel.startTyping();
				// We have one, test it.
				var key = match[0];
				gw2.request('/v2/tokeninfo', key, function(err, token) {
					message.channel.stopTyping();
					if (err) {
						console.log(err);
						message.reply("Sorry, an error occurred.  Please try again later.");
						return;
					}
					if (! token.name.match(oc.code)) {
						message.reply("The key you provided does not have the code **"+oc.code+"** in the name.");
						return;
					}
					var permissions = token.permissions.map((p) => '**'+p+'**').join(', ');
					db.setUserKey(message.author.id, key, token, function(err) {
						message.reply("The key **"+token.name+"** has been associated with you.  This key grants the following permissions: "+permissions);
						delete open_codes[message.author.id];
						checkUserAccount(message.author);
					});
				});
			}
		}
		if (message.content === "showtoken") {
			db.getUserToken(message.author.id, (err, token) => {
				message.reply('```'+token+'```');
			});
		}
		if (message.content === "account") {
			checkUserAccount(message.author);
		}
	}
}

function presenceChanged(oldUser, newUser) {
	if (oldUser.status !== 'online' && newUser.status === 'online') checkUserAccount(newUser);
}

function newMember(server, user) {
	checkUserAccount(user, function(err, hasAccount) {
		if (! hasAccount) user.sendMessage('Welcome!  Send me the message "link" when you are ready to apply a Guild Wars 2 API key.');
	});
}

function initServer(server, callback) {
	if (! callback) callback = function() { };
	var member_role = config.get('guild.member_role');
	var world_role = config.get('world.role');
	async.parallel([
		function(next) {
			if (! member_role) return next();
			if (server.roles.has('name', member_role)) next();
			else server.createRole({
				name: member_role,
				hoist: false,
				mentionable: true
			}, next);
		},
		function(next) {
			if (! world_role) return next();
			if (server.roles.has('name', world_role)) next();
			else server.createRole({
				name: world_role,
				hoist: false,
				mentionable: true
			}, next);
		}
	], callback);
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
	bot.on("presence", presenceChanged);
	//bot.on("serverNewMember", newMember);
	bot.on("serverCreated", initServer);

	bot.on("ready", function() {
		async.each(bot.servers, initServer);
	});
};
