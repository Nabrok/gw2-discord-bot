var
	Promise = require('bluebird'),
	config = require('config'),
	db = require('../lib/database'),
	gw2 = require('../lib/gw2'),
	phrases = require('../lib/phrases')
;
const { gql } = require('apollo-server');

var guild_id = config.has('guild.id') ? config.get('guild.id') : null;
var guild_key = config.has('guild.key') ? config.get('guild.key') : null;

var world_id = config.has('world.id') ? config.get('world.id') : null;
var world_role_name = config.has('world.role') ? config.get('world.role') : null;
var guild_role_name = config.has('guild.member_role') ? config.get('guild.member_role') : null;

const refresh_member_interval = config.has('refresh_member_interval') ? config.get('refresh_member_interval') * 1000 : null;

var open_codes = {}; // Codes we're currently expecting to see in an API key name

const typeDefs = gql`
enum GW2AccountAccess { None PlayForFree GuildWars2 HeartOfThorns PathOfFire }
enum GW2Population { Low Medium High VeryHigh Full }

type GW2World {
	id: ID!
	name: String
	population: GW2Population
}

type GW2Account {
	id: ID!
	name: String
	age: Int
	world: GW2World
	created: Date
	access: [GW2AccountAccess]
	commander: Boolean
	fractal_level: Int
	daily_ap: Int
	monthly_ap: Int
	wvw_rank: Int
	last_modified: Date
}

extend type DiscordUser {
	gw2: GW2Account
}
`;

function requestAPIKey(user) {
	var code = Math.random().toString(36).toUpperCase().substr(2, 5);
	open_codes[user.id] = {
		code: code,
		user: user
	};
	// Remove code in 5 minutes
	setTimeout(function() { delete open_codes[user.id] }, 5 * 60 * 1000);
	return user.sendMessage(phrases.get("LINK_REPLY_WITH_KEY", { code: code }));
}

function checkUserAccount(user) {
	var bot = user.client;
	return db.getUserKey(user.id)
		.then(key => {
			if (! key) throw new Error('no key');
			return gw2.request('/v2/account', key);
		})
		.then(account => {
			var in_guild = (account.guilds.indexOf(guild_id) > -1);
			return db.setUserAccount(user.id, account).then(() => {
				var promises = [];
				bot.guilds.forEach(server => {
					var add_roles = [];
					var del_roles = [];
					var guser = server.members.get(user.id);
					if (! guser) return;
					if (world_role_name) {
						var world_role = server.roles.find(role => role.name === world_role_name);
						if (account.world !== world_id && guser.roles.has(world_role.id))
							del_roles.push(world_role);
						else if (account.world === world_id && ! guser.roles.has(world_role.id))
							add_roles.push(world_role);
					}
					if (guild_role_name) {
						var guild_role = server.roles.find(role => role.name === guild_role_name);
						if (in_guild && ! guser.roles.has(guild_role.id))
							add_roles.push(guild_role);
						else if (guser.roles.has(guild_role.id) && ! in_guild)
							del_roles.push(guild_role);
					}
					if (add_roles.length > 0) promises.push(guser.addRoles(add_roles));
					if (del_roles.length > 0) promises.push(guser.removeRoles(del_roles));
				});
				return Promise.all(promises);
			});
		})
		.catch(err => {
			if (err.message === 'endpoint requires authentication' || err.message === 'invalid key') {
				console.log('removing user '+user.id);
				const promises = [ db.removeUser(user.id) ];
				bot.guilds.forEach(server => {
					var guser = server.members.get(user.id);
					var removeRoles = [];
					if (! guser) return;
					if (world_role_name) {
						var world_role = server.roles.find(role => role.name === world_role_name);
						removeRoles.push(world_role);
					}
					if (guild_role_name) {
						var guild_role = server.roles.find(role => role.name === guild_role_name);
						removeRoles.push(guild_role);
					}
					if (removeRoles.length > 0) promises.push(guser.removeRoles(removeRoles));
				});
				return Promise.all(promises);
			}
			throw err;
		})
		.then(() => {
			if (guild_key && guild_id)
				return gw2.request('/v2/guild/'+guild_id+'/members', guild_key)
					.catch(e => {
						if (e.message === 'access restricted to guild leaders') {
							guild_key = null;
							return;
						}
						throw e;
					});
		})
		.catch(err => {
			if (err.message === 'no key') return;
			if (err.message === 'invalid key') return;
			console.error('Error checking account: '+err.message, err.stack);
		});
	
}

function messageReceived(message) {
	if (message.channel.type === 'dm') {
		if (message.content.match(new RegExp('^!?'+phrases.get("LINK_LINK")+'$', 'i'))) {
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
				gw2.request('/v2/tokeninfo', key).then(token => {
					if (! token.name.match(oc.code)) {
						return message.reply(phrases.get("LINK_KEY_DOESNT_MATCH", { code: oc.code }));
					}
					var permissions = token.permissions.map((p) => '**'+p+'**').join(', ');
					return db.setUserKey(message.author.id, key, token)
						.then(() => message.reply(phrases.get("LINK_KEY_DETAILS", { name: token.name, permissions: permissions })))
						.then(() => {
							delete open_codes[message.author.id];
							return checkUserAccount(message.author)
								.then(() => gw2.request('/v2/account', key));
						})
					;
				}).catch(err => {
					console.error(err.stack);
					return message.reply(phrases.get("LINK_ERROR"));
				}).then(() => message.channel.stopTyping());
			}
		}
		if (message.content === "showtoken") {
			message.channel.startTyping();
			db.getUserToken(message.author.id)
				.then(token => message.reply('```'+JSON.stringify(token, undefined, 2)+'```'))
				.catch(e => console.error(e.stack))
				.then(() => message.channel.stopTyping())
			;
		}
		if (message.content === "account") {
			checkUserAccount(message.author);
		}
	}
}

function presenceChanged(oldUser, newUser) {
	if (oldUser.presence.status !== 'online' && newUser.presence.status === 'online')
		checkUserAccount(newUser);
}

function checkMembers(bot) {
	const members = bot.guilds.reduce((members, guild) => members.concat(guild.members.array()), []);
	return Promise.all(members.map(m => checkUserAccount(m)));
}

function initServer(server) {
	var promises = [];
	if (guild_role_name && ! server.roles.some(role => role.name === guild_role_name)) {
		promises.push(server.createRole({
			name: guild_role_name,
			hoist: false,
			mentionable: true
		}));
	}
	if (world_role_name && ! server.roles.some(role => role.name === world_role_name)) {
		promises.push(server.createRole({
			name: world_role_name,
			hoist: false,
			mentionable: true
		}));
	}
	return Promise.all(promises);
}

gw2.on('/v2/account', (account, key, from_cache) => {
	if (from_cache) return;
	// TODO: Some of the code from checkUserAccount could probably go here
});

/**
 * @param {import('discord.js').Client} bot
 */
module.exports = function(bot) {
	bot.on("message", messageReceived);
	bot.on("presenceUpdate", presenceChanged);
	bot.on("guildCreate", initServer);

	bot.on("ready", function() {
		Promise.all(bot.guilds.map(initServer))
			.then(() => checkMembers(bot))
			.catch(e => console.error(e.stack));
	});

	if (refresh_member_interval) {
		setInterval(() => checkMembers(bot), refresh_member_interval);
	}

	return { typeDefs, resolvers: {
		DiscordUser: {
			gw2: user => db.getAccountByUser(user.id)
		},
		GW2Account: {
			world: account => gw2.getWorlds([ account.world ]).then(r => r[account.world])
		}
	} };
};
