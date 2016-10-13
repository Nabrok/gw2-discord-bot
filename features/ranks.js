var
	Promise = require('bluebird'),
	config = require('config'),
	db = Promise.promisifyAll(require('../lib/db')),
	gw2 = require('../lib/gw2'),
	phrases = require('../lib/phrases')
;

var guild_id = config.has('guild.id') ? config.get('guild.id') : null;
var guild_key = config.has('guild.key') ? config.get('guild.key') : null;
var member_role_name = config.has('guild.member_role') ? config.get('guild.member_role') : null;
var create_roles = config.has('guild.create_roles') ? config.get('guild.create_roles') : true;

// Create necessary roles in discord.  Can't seem to get the sorting working, so that has to be done manually.
function initServer(server, ranks) {
	if (! create_roles) return;
	return Promise.all(ranks
		.filter(r => ! server.roles.has('name', r.id))
		.map(r => server.createRoleAsync({
			name: r.id,
			hoist: true,
			mentionable: true
		}))
	);
}

function delay(ms) {
	return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

function syncMembersToRoles(server, members, ranks) {
	var bot = server.client;
	return initServer(server, ranks)
		.then(() => {
			var membersInRank = {};
			ranks.forEach(r => membersInRank[r.id] = []);
			var allMembers = [];
			var member_role = (member_role_name) ? server.roles.get('name', member_role_name) : null;
			return Promise.all(members
				.filter(member => server.roles.has('name', member.rank)) // Ignore rank with no corresponding role
				.map(member => db.getUserByAccountAsync(member.name).then(user_id => {
					if (! user_id) return;
					allMembers.push(member.name);
					var user = Promise.promisifyAll(bot.users.get('id', user_id));
					var funcs = [];
					if (member_role && ! user.hasRole(member_role)) funcs.push(() => user.addToAsync(member_role));
					ranks.forEach(rank => {
						var role = server.roles.get('name', rank.id);
						if (rank.id === member.rank) {
							membersInRank[member.rank].push(member.name);
							if (! user.hasRole(role)) funcs.push(() => user.addToAsync(role));
						} else {
							if (user.hasRole(role)) funcs.push(() => user.removeFromAsync(role));
						}
					});
					//return funcs.reduce((p, f) => p.then(f), Promise.resolve());
					// For reasons we need to add a timeout to make this work properly.  Revisit with a future discord.js version.
					return funcs.reduce((p, f) => p.then(f).then(() => delay(200)), Promise.resolve());
				}))
			).then(() => {
				// Remove anybody not in the guild roster
				var promises = [];
				var funcs = [];
				if (member_role) {
					var users_with_role = server.usersWithRole(member_role);
					promises = promises.concat(
						users_with_role.map(user =>
							db.getAccountByUserAsync(user.id)
							.then(account => {
								var userAsync = Promise.promisifyAll(user);
								if (! account || allMembers.indexOf(account.name) === -1) funcs.push(() => userAsync.removeFromAsync(member_role));
								return true;
							})
						)
					);
				}
				ranks.filter(rank => server.roles.has('name', rank.id)).forEach(rank => {
					var role = server.roles.get('name', rank.id);
					var users_with_role = server.usersWithRole(role);
					promises = promises.concat(users_with_role.map(user => db.getAccountByUserAsync(user.id).then(account => {
						var userAsync = Promise.promisifyAll(user);
						if (! account || membersInRank[rank.id].indexOf(account.name) === -1) funcs.push(() => userAsync.removeFromAsync(role));
						return true;
					})));
				});
				return Promise.all(promises)
				// This should work, but it doesn't
				//.then(() => funcs.reduce((p, f) => p.then(f), Promise.resolve()))
				// Adding a timeout makes it work.  Maybe revisit this with a future discord.js version.
				.then(() => funcs.reduce((p, f) => p.then(f).then(() => delay(200)), Promise.resolve()))
			});
		})
	;
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
	gw2.request('/v2/guild/'+guild_id+'/ranks', guild_key)
		.then(ranks => Promise.all(
			bot.servers.map(server => initServer(Promise.promisifyAll(server), ranks))
		))
	;
}

function joinedServer(server) {
	gw2.request('/v2/guild/'+guild_id+'/ranks', guild_key)
		.then(ranks => initServer(Promise.promisifyAll(server), ranks))
	;
}

module.exports = function(bot) {
	if (! (guild_id && guild_key)) {
		console.log('ranks feature requires a guild ID and key.');
		return;
	}
	// Whenever the member list for the guild is called, update everybody's ranks
	gw2.on('/v2/guild/'+guild_id+'/members', (members, key, from_cache) => {
		gw2.request('/v2/guild/'+guild_id+'/ranks', key)
			.then(ranks => Promise.all(
				bot.servers.map(server => syncMembersToRoles(Promise.promisifyAll(server), members, ranks))
			))
		;
	});

	bot.on("message", messageReceived);
	bot.on("ready", function() { botReady(bot) });
	bot.on("serverCreated", joinedServer);
};
