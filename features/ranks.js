var
	async = require('async'),
	config = require('config'),
	db = require('../lib/db'),
	gw2 = require('../lib/gw2'),
	phrases = require('../lib/phrases')
;

var guild_id = config.has('guild.id') ? config.get('guild.id') : null;
var guild_key = config.has('guild.key') ? config.get('guild.key') : null;
var member_role_name = config.has('guild.member_role') ? config.get('guild.member_role') : null;

// Create necessary roles in discord.  Can't seem to get the sorting working, so that has to be done manually.
function initServer(server, ranks, callback) {
	if (! callback) callback = function() { };
	async.each(ranks, (r, next_rank) => {
		if (server.roles.has('name', r.id)) next_rank();
		else server.createRole({
			name: r.id,
			hoist: true,
			mentionable: true
		}, next_rank);
	}, callback);
}

function syncMembersToRoles(server, members, ranks, callback) {
	var bot = server.client;
	async.series([
		function(next) { initServer(server, ranks, next); }
	], function(err) {
		if (err) return callback(err);
		var membersInRank = {};
		ranks.forEach(rank => { membersInRank[rank.id] = []; });
		var allMembers = [];
		var member_role = (member_role_name) ? server.roles.get('name', member_role_name) : null;
		async.each(members, function(member, next_member) {
			// Add or remove people in the guild roster
			if (! server.roles.has('name', member.rank)) return next_member();
			db.getUserByAccount(member.name, function(err, user_id) {
				if (! user_id) return next_member();
				allMembers.push(member.name);
				var user = bot.users.get('id', user_id);
				async.parallel([
					function(next) {
						if (! member_role) return next();
						if (! user.hasRole(member_role)) user.addTo(member_role, next);
						else next();
					},
					function(next) {
						async.each(ranks, function(rank, next_rank) {
							var role = server.roles.get('name', rank.id);
							if (rank.id === member.rank) {
								membersInRank[member.rank].push(member.name);
								if (user.hasRole(role)) next_rank();
								else user.addTo(role, next_rank);
							}
							else if (user.hasRole(role)) {
								user.removeFrom(role, next_rank);
							}
							else next_rank();
						}, next);
					}
				], next_member);
			});
		}, function(err) {
			// Remove anybody not in the guild roster
			async.parallel([
				function(next) {
					if (! member_role) return next();
					var users_with_role = server.usersWithRole(member_role);
					async.each(users_with_role, function(user, next_user) {
						db.getAccountByUser(user.id, function(err, account) {
							if (! account || allMembers.indexOf(account.name) === -1) user.removeFrom(member_role, next_user);
							else next_user();
						});
					}, next);
				},
				function(next) {
					async.each(ranks, function(rank, next_rank) {
						if (! server.roles.has('name', rank.id)) return next_rank();
						var role = server.roles.get('name', rank.id);
						var users_with_role = server.usersWithRole(role);
						async.each(users_with_role, function(user, next_user) {
							db.getAccountByUser(user.id, function(err, account) {
								if (! account || membersInRank[rank.id].indexOf(account.name) === -1) user.removeFrom(role, next_user);
								else next_user();
							});
						}, next_rank);
					}, next);
				}
			], callback);
		});
	});
}

function messageReceived(message) {
	if (message.channel.isPrivate) {
		if (message.content === "refresh members") {
			message.channel.startTyping(function() {
				gw2.request('/v2/guild/'+guild_id+'/members', guild_key, function() {
					message.channel.stopTyping(function() {
						message.reply(phrases.get("RANKS_MEMBERS_UPDATED"));
					});
				});
			});
		}
	}
}

function botReady(bot) {
	gw2.request('/v2/guild/'+guild_id+'/ranks', guild_key, function(err, ranks) {
		if (err) {
			console.log(err.message);
			return;
		}
		async.each(bot.servers, function(server, next_server) {
			initServer(server, ranks, next_server);
		});
	});
}

function joinedServer(server) {
	gw2.request('/v2/guild/'+guild_id+'/ranks', guild_key, function(err, ranks) {
		initServer(server, ranks);
	});
}

module.exports = function(bot) {
	if (! (guild_id && guild_key)) {
		console.log('ranks feature requires a guild ID and key.');
		return;
	}
	// Whenever the member list for the guild is called, update everybody's ranks
	gw2.addHook('/v2/guild/'+guild_id+'/members', function(members, key, next_hook) {
		gw2.request('/v2/guild/'+guild_id+'/ranks', key, function(err, ranks) {
			if (err) {
				console.log(err.message);
				return next_hook(err);
			}
			async.each(bot.servers, function(server, next_server) {
				syncMembersToRoles(server, members, ranks, next_server);
			}, next_hook);
		});
	});

	bot.on("message", messageReceived);
	bot.on("ready", function() { botReady(bot) });
	bot.on("serverCreated", joinedServer);
};
