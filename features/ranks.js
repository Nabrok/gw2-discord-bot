var
	Promise = require('bluebird'),
	config = require('config'),
	db = require('../lib/database'),
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
		.filter(r => ! server.roles.some(role => role.name === r.id))
		.map(r => server.createRole({
			name: r.id,
			hoist: true,
			mentionable: true
		}))
	);
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function syncMembersToRoles(server, members, ranks) {
	await initServer(server, ranks);
	const membersInRank = {};
	ranks.forEach(r => membersInRank[r.id] = []);
	const allMembers = [];
	const member_role = (member_role_name) ? server.roles.find(role => role.name === member_role_name) : null;
	await Promise.all(members
		.filter(member => server.roles.some(role => role.name === member.rank)) // Ignore rank with no corresponding role
		.map(member => db.getUserByAccount(member.name).then(async user_id => {
			if (! user_id) return;
			allMembers.push(member.name);
			const user = await server.fetchMember(user_id);
			const funcs = [];
			if (member_role && ! user.roles.has(member_role.id)) funcs.push(() => user.addRole(member_role));
			ranks.forEach(rank => {
				var role = server.roles.find(role => role.name === rank.id);
				if (rank.id === member.rank) {
					membersInRank[member.rank].push(member.name);
					if (! user.roles.has(role.id)) funcs.push(() => user.addRole(role));
				} else {
					if (user.roles.has(role.id)) funcs.push(() => user.removeRole(role));
				}
			});
			//return funcs.reduce((p, f) => p.then(f), Promise.resolve());
			// For reasons we need to add a timeout to make this work properly.  Revisit with a future discord.js version.
			return funcs.reduce((p, f) => p.then(f).then(() => delay(200)), Promise.resolve());
		}))
	);
	// Remove anybody not in the guild roster
	let promises = [];
	const funcs = [];
	if (member_role) {
		const users_with_role = member_role.members;
		promises = promises.concat(
			users_with_role.map(user =>
				db.getAccountByUser(user.id)
					.then(account => {
						if (! account || allMembers.indexOf(account.name) === -1) funcs.push(() => user.removeRole(member_role));
						return true;
					})
			)
		);
	}
	ranks.filter(rank => server.roles.some(role => role.name === rank.id)).forEach(rank => {
		var role = server.roles.find(role => role.name === rank.id);
		var users_with_role = role.members;
		promises = promises.concat(users_with_role.map(user => db.getAccountByUser(user.id).then(account => {
			if (! account || membersInRank[rank.id].indexOf(account.name) === -1) funcs.push(() => user.removeRole(role));
			return true;
		})));
	});
	return Promise.all(promises)
		// This should work, but it doesn't
		//.then(() => funcs.reduce((p, f) => p.then(f), Promise.resolve()))
		// Adding a timeout makes it work.  Maybe revisit this with a future discord.js version.
		.then(() => funcs.reduce((p, f) => p.then(f).then(() => delay(200)), Promise.resolve()));
}

function messageReceived(message) {
	if (message.channel.type === 'dm') {
		if (message.content === "refresh members") {
			message.channel.startTyping();
			gw2.request('/v2/guild/'+guild_id+'/members', guild_key)
				.then(() => message.reply(phrases.get("RANKS_MEMBERS_UPDATED")))
				.catch(e => console.error(e.stack))
				.then(() => message.channel.stopTyping())
			;
		}
	}
}

function botReady(bot) {
	gw2.request('/v2/guild/'+guild_id+'/ranks', guild_key)
		.then(ranks => Promise.all(
			bot.guilds.map(server => initServer(server, ranks))
		))
		.catch(e => {
			console.error(`Error retrieving /v2/guild/${guild_id}/ranks: ${e.message}`);
		})
	;
}

function joinedServer(server) {
	gw2.request('/v2/guild/'+guild_id+'/ranks', guild_key)
		.then(ranks => initServer(server, ranks))
		.catch(e => {
			console.error(`Error retrieving /v2/guild/${guild_id}/ranks: ${e.message}`);
		})
	;
}

module.exports = function(bot) {
	if (! (guild_id && guild_key)) {
		console.log('ranks feature requires a guild ID and key.');
		return;
	}
	// Whenever the member list for the guild is called, update everybody's ranks
	gw2.on('/v2/guild/'+guild_id+'/members', (members, key) => {
		gw2.request('/v2/guild/'+guild_id+'/ranks', key)
			.then(ranks => Promise.all(
				bot.guilds.map(server => syncMembersToRoles(server, members, ranks))
			))
		;
	});

	bot.on("message", messageReceived);
	bot.on("ready", function() { botReady(bot) });
	bot.on("guildCreate", joinedServer);
};
