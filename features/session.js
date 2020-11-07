var
	Promise = require('bluebird'),
	db = require('../lib/database'),
	gw2 = require('../lib/gw2'),
	diff = require('deep-diff').diff,
	phrases = require('../lib/phrases')
;
const gql = require('graphql-tag');

const typeDefs = gql`
extend type Query {
	last_session: Session
}

type Session {
	start_time: Date
	stop_time: Date
	diff: JSON
}
`;

const session_prefix = 'session';
const archive_prefix = 'session_archive';
const relog_window = 60 /* seconds */ * 60 /* minutes */ * 1000; // 1 hour in milliseconds
const archive_ttl = 604800; // 7 days in seconds

function resultsToObject(start, key, results) {
	return start.reduce((t,q,i) => {
		t[q[key]] = results[i];
		return t;
	}, {});
}

function gatherData(user) {
	return Promise.all([db.getUserKey(user.id), db.getUserToken(user.id)])
		.then(result => {
			var key = result[0], token = result[1] ? result[1] : {};
			if (! key) throw new Error("endpoint requires authentication");
			var permissions = token.permissions || [];
			var queries = [];
			if (permissions.indexOf('progression') > -1) {
				queries.push({ name: 'account', promise: () => gw2.request('/v2/account', key) });
				queries.push({ name: 'achievements', promise: () => gw2.request('/v2/account/achievements', key) });
			}
			if (permissions.indexOf('unlocks') > -1) {
				queries.push({ name: 'skins', promise: () => gw2.request('/v2/account/skins', key) });
				queries.push({ name: 'titles', promise: () => gw2.request('/v2/account/titles', key) });
				queries.push({ name: 'minis', promise: () => gw2.request('/v2/account/minis', key) });
				queries.push({ name: 'outfits', promise: () => gw2.request('/v2/account/outfits', key) });
				queries.push({ name: 'dyes', promise: () => gw2.request('/v2/account/dyes', key) });
				queries.push({ name: 'finishers', promise: () => gw2.request('/v2/account/finishers', key) });
			}
			if (permissions.indexOf('wallet') > -1) {
				queries.push({ name: 'wallet', promise: () => gw2.request('/v2/account/wallet', key) });
			}
			if (permissions.indexOf('inventories') > -1) {
				queries.push({ name: 'materials', promise: () => gw2.request('/v2/account/materials', key) });
				queries.push({ name: 'bank', promise: () => gw2.request('/v2/account/bank', key) });
				queries.push({ name: 'inventory', promise: () => gw2.request('/v2/account/inventory', key) });
			}
			if (permissions.indexOf('pvp') > -1) {
				queries.push({ name: 'pvp', promise: () => gw2.request('/v2/pvp/stats', key) });
			}
			if (permissions.indexOf('characters') > -1) {
				queries.push({ name: 'characters', promise: () => gw2.request('/v2/characters', key).then(characters => {
					var char_queries = characters.map(c => ({
						name: c,
						promise: () => gw2.request('/v2/characters/'+encodeURIComponent(c), key)
					}));
					return Promise.map(char_queries, c => c.promise(), { concurrency: 3 }).then(results => resultsToObject(char_queries, 'name', results));
				})});
			}
			return Promise.map(queries, q => q.promise(), { concurrency: 5 }).then(results => resultsToObject(queries, 'name', results));
		});
}

async function startPlaying(user) {
	const session_name = session_prefix+':'+user.id;
	const time = new Date();
	try {
		const session = await db.getObject(session_name);
		if (session && session.stop && (time - new Date(session.stop.time) <= relog_window)) {
			// recent login/logout
			delete session.stop;
			await db.setObject(session_name, session);
		}
		if (session && ! session.stop) return; // No logout data (presumed bot restart)
		const new_session = { start: { time: time } };
		const data = await gatherData(user);
		new_session.start.data = data;
		await db.setObject(session_name, new_session);
	} catch(err) {
		if (err.message === "endpoint requires authentication") return;
		console.error("Error starting session",err);
	}
}

/**
 * 
 * @param {import('discord.js').User} user 
 * @param {boolean} refresh 
 */
async function stopPlaying(user, refresh = false) {
	const session_name = session_prefix+':'+user.id;
	const time = new Date();
	try {
		const session = await db.getObject(session_name);
		if (! session) throw new Error('no session');
		if (! refresh) session.stop = { time: time };

		const data = await gatherData(user);
		session.stop.data = data;
		await db.setObject(session_name, session);

		// Save archive
		const diff = getSessionDiff(session);
		if (! diff) return; // Nothing changed in the session
		const archive_name = archive_prefix+":"+user.id+":"+(new Date(session.start.time).getTime());
		const archive = {
			start_time: session.start.time,
			stop_time: session.stop.time,
			diff: diff
		};
		await db.setObject(archive_name, archive);
		await db.expireCache(archive_name, archive_ttl);
	} catch(err) {
		if (err.message === "endpoint requires authentication") return;
		if (err.message === "invalid key") return;
		if (err.message === "no session") throw err; // rethrow
		console.error("Error stopping session", err);
	}
}

function checkUsers(users) {
	users.forEach(user => {
		if (! user.presence.game) return;
		if (user.presence.game.name !== "Guild Wars 2") return;
		startPlaying(user);
	});
}

function getSessionDiff(session) {
	// Rearrange some arrays into key/value pairs by id (makes it easier to diff)
	['start', 'stop'].forEach(t => {
		if (! session[t]) return;
		['wallet', 'achievements', 'finishers'].forEach(d => {
			if (! session[t].data[d]) return;
			session[t].data[d] = session[t].data[d].reduce((total, i) => {
				total[i.id] = i;
				return total;
			}, {});
		});
		['skins', 'titles', 'minis', 'outfits', 'dyes'].forEach(d => {
			if (! session[t].data[d]) return;
			session[t].data[d] = session[t].data[d].reduce((total, i) => {
				total[i] = true;
				return total;
			}, {});
		});
		// Total count of items (no matter where they are)
		session[t].data.all_items = {};
		['materials', 'bank', 'shared'].forEach(s => {
			if (! session[t].data[s]) return;
			session[t].data.all_items = session[t].data[s].reduce((total,i) => {
				if (!i) return total;
				if (total[i.id]) total[i.id] += i.count;
				else total[i.id] = i.count;
				return total;
			}, session[t].data.all_items);
		});
		if (session[t].data.characters) Object.keys(session[t].data.characters).forEach(c => {
			var character = session[t].data.characters[c];
			if (! character.bags) return;
			session[t].data.all_items = character.bags.reduce((total, b) => {
				if (! b) return total;
				b.inventory.forEach(i => {
					if (! i) return;
					if (total[i.id]) total[i.id] += i.count;
					else total[i.id] = i.count;
				});
				return total;
			}, session[t].data.all_items);
			session[t].data.all_items = character.equipment.reduce((total, e) => {
				if (total[e.id]) total[e.id] += 1;
				else total[e.id] = 1;
				return total;
			}, session[t].data.all_items);
		});
	});
	var differences = diff(session.start.data, session.stop.data);
	return differences;
}

async function getSession(user) {
	const session_name = session_prefix+':'+user.id;
	const session = await db.getObject(session_name);
	if (! session) {
		const account = await db.getAccountByUser(user.id);
		if (! account) throw new Error('no user account');
		throw new Error('no session');
	}
	if (session.stop) return session;

	// Still in progress
	const data = await gatherData(user);
	session.stop = { time: new Date(), data };
	return session;
}

async function parseSession(user) {
	try {
		const session = await getSession(user);
		const time_in_ms = new Date(session.stop.time) - new Date(session.start.time);
		const time_in_mins = Math.round(time_in_ms / 60000);
		const sentences = [];
		sentences.push(phrases.get("SESSION_PLAYTIME", { minutes: time_in_mins }));
		if (! session.start.data) return sentences.join("  "); // No data from API, show play time only.

		const wvw_stats = [];
		const pvp_stats = [];
		const new_achievements = [];
		const items_gained = [];
		const items_lost = [];
		let pvp_rank_ups = 0;
		const differences = getSessionDiff(session);
		if (differences) differences.forEach(d => {
			// account differences
			if (d.path[0] === "account" && d.path[1] === "wvw_rank") wvw_stats.push(phrases.get("SESSION_WVW_RANK", { number: (d.rhs - d.lhs) }));
			if (d.path[0] === "account" && d.path[1] === "fractal_level") sentences.push(phrases.get("SESSION_FRACTAL_LEVEL", { levels: (d.rhs - d.lhs) }));
			// wallet differences
			if (d.path[0] === "wallet" && d.path[1] === "1") {
				var change = d.rhs - d.lhs;
				if (change > 0) sentences.push(phrases.get("SESSION_COINS_GAINED", { coins: coinsToGold(change) }));
				else sentences.push(phrases.get("SESSION_COINS_LOST", { coins: coinsToGold(change) }));
			}
			// achievement differences
			if (d.path[0] === "achievements") {
				if ((d.kind === "N" && d.rhs.done) || (d.kind === "E" && d.path[2] === "done")) {
					new_achievements.push(d.path[1]);
				}
				// PvP stuff
				if (d.path[2] === "current") {
					if (d.path[1] === "239") pvp_stats.push(phrases.get("SESSION_PVP_KILLS", { count: d.rhs - d.lhs }));
					if (d.path[1] === "265") pvp_stats.push(phrases.get("SESSION_PVP_RATED_WINS", { count: d.rhs - d.lhs }));
					if (d.path[1] === "241") {
						const unrated_before = session.start.data.achievements['241'].current - session.start.data.achievements['265'].current;
						const unrated_after = session.stop.data.achievements['241'].current - session.stop.data.achievements['265'].current;
						const unrated_diff = unrated_after - unrated_before;
						if (unrated_diff) pvp_stats.push(phrases.get("SESSION_PVP_UNRATED_WINS", { count: unrated_diff }));
					}
				}
				// WvW stuff
				if (d.path[1] === "283") wvw_stats.push(phrases.get("SESSION_WVW_PLAYERS", { count:(d.rhs - d.lhs).toLocaleString() }));
				if (d.path[1] === "288") wvw_stats.push(phrases.get("SESSION_WVW_YAKS", { count: (d.rhs - d.lhs).toLocaleString() }));
				if (d.path[1] === "291") wvw_stats.push(phrases.get("SESSION_WVW_CAMPS", { count: (d.rhs - d.lhs).toLocaleString() }));
				if (d.path[1] === "297") wvw_stats.push(phrases.get("SESSION_WVW_TOWERS", { count: (d.rhs - d.lhs).toLocaleString() }));
				if (d.path[1] === "300") wvw_stats.push(phrases.get("SESSION_WVW_KEEPS", { count: (d.rhs - d.lhs).toLocaleString() }));
				if (d.path[1] === "294") wvw_stats.push(phrases.get("SESSION_WVW_CASTLES", { count: (d.rhs - d.lhs).toLocaleString() }));
			}
			// item differences
			if (d.path[0] === "all_items") {
				let change;
				if (d.kind === "E") change = d.rhs - d.lhs;
				if (d.kind === "N") change = d.rhs;
				if (d.kind === "D") change = d.lhs * -1;
				if (change > 0) {
					items_gained.push({ id: d.path[1], change: change });
				} else {
					items_lost.push({ id: d.path[1], change: change * -1 });
				}
			}
			// pvp differences
			if (d.path[0] === "pvp") {
				if (d.path[1] === "pvp_rank" || d.path[1] === "pvp_rank_rollovers") pvp_rank_ups += (d.rhs - d.lhs);
			}
		});
		if (pvp_rank_ups) pvp_stats.unshift(phrases.get("SESSION_PVP_RANK", { number: pvp_rank_ups }));
		if (pvp_stats.length > 0) sentences.push(phrases.get("SESSION_PVP", { counts: pvp_stats.join(", ") }));
		if (wvw_stats.length > 0) sentences.push(phrases.get("SESSION_WVW", { counts: wvw_stats.join(", ") }));
		const [ach, prices] = await Promise.all([
			gw2.getAchievements(new_achievements),
			gw2.getPrices(items_gained.map(i => i.id).concat(items_lost.map(i => i.id)))
		]);
		if (new_achievements.length > 0) sentences.push(phrases.get("SESSION_ACHIEVEMENTS", { count: new_achievements.length, list: new_achievements.filter(a => !! ach[a]).map(a => ach[a].name).join(", ") }));
		if (items_gained.length > 0) {
			const value_gained = items_gained.reduce((t, i) => (t + (i.change * (prices[i.id] ? prices[i.id].buys.unit_price : 0))), 0);
			sentences.push(phrases.get("SESSION_ITEMS_GAINED", { count: items_gained.length, value: coinsToGold(value_gained) }));
		}
		if (items_lost.length > 0) {
			const value_lost = items_lost.reduce((t, i) => (t + (i.change * (prices[i.id] ? prices[i.id].buys.unit_price : 0))), 0);
			sentences.push(phrases.get("SESSION_ITEMS_LOST", { count: items_lost.length, value: coinsToGold(value_lost) }));
		}
		return sentences.join("  ");
	} catch(err) {
		if (err.message === "endpoint requires authentication") return;
		if (err.message === "invalid key") return;
		console.error("Error gathering session data: "+err.message);
		throw err;
	}
}

function coinsToGold(coins) {
	var gold = Math.floor(coins / 10000);
	var silver = Math.floor((coins - (gold * 10000)) / 100);
	var copper = coins - (gold * 10000) - (silver * 100);
	var string = "";
	if (gold) string += phrases.get("CORE_GOLD", { count: gold })+" ";
	if (silver || gold) string += phrases.get("CORE_SILVER", { count: (silver || "0") })+" ";
	string += phrases.get("CORE_COPPER", { count: (copper || "0") });
	return string;
}

const refresh_timers = {};

/**
 * 
 * @param {import('discord.js').GuildMember} oldState 
 * @param {import('discord.js').GuildMember} newState 
 */
function presenceChanged(oldState, newState) {
	const isPlaying = newState.presence.activities && newState.presence.activities.some(activity => activity.name === 'Guild Wars 2');
	const wasPlaying = oldState.presence.activities && oldState.presence.activities.some(activity => activity.name === 'Guild Wars 2');
	if (isPlaying && ! wasPlaying) {
		// User started playing
		if (refresh_timers[newState.id]) clearTimeout(refresh_timers[newState.id]);
		startPlaying(newState);
	}
	if (wasPlaying && ! isPlaying) {
		// User stopped playing
		stopPlaying(newState).then(() => {
			// Refresh data in 5 minutes to make sure we don't have old cached data
			refresh_timers[newState.id] = setTimeout(function() {
				stopPlaying(newState, true).catch(err => {
					if (err.message === "no session") return;
					if (err.message === "invalid key") return;
					console.error("Error stopping session: " + err.message);
				});
				delete refresh_timers[newState.id];
			}, 305000);
		}).catch(err => {
			if (err.message === "no session") return;
			if (err.message === "invalid key") return;
			console.error("Error stopping session: " + err.message);
		});
	}
}

async function messageReceived(message) {
	var cmd = new RegExp('^!'+phrases.get("SESSION_SHOWLAST")+'$', 'i');
	if (! message.content.match(cmd)) return;
	message.channel.startTyping();
	const response = await parseSession(message.author).catch(err => {
		if (err.message === 'no user account') return phrases.get("CORE_NO_KEY");
		if (err.message === "no session") return phrases.get("SESSION_NO_SESSION");
		return phrases.get("CORE_ERROR");
	});
	await message.reply(response);
	message.channel.stopTyping();
}

/**
 * 
 * @param {import('discord.js').Client} bot 
 */
module.exports = bot => {
	bot.on("ready", () => {
		checkUsers(bot.users);
	});
	bot.on("presenceUpdate", presenceChanged);
	bot.on("message", messageReceived);

	return { typeDefs, resolvers: {
		Query: {
			last_session: (_, _args, { user }) => getSession(user)
		},
		Session: {
			start_time: session => new Date(session.start.time),
			stop_time: session => new Date(session.stop.time),
			diff: session => getSessionDiff(session)
		}
	} };
};
