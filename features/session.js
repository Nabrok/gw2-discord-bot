var
	async = require('async'),
	db = require('../lib/db'),
	gw2 = require('../lib/gw2'),
	diff = require('deep-diff').diff,
	phrases = require('../lib/phrases')
;

const session_prefix = 'session';
const relog_window = 300000; // 5 minutes

function gatherData(user, callback) {
	async.waterfall([
		function(next) {
			async.parallel({
				key: function(next) { db.getUserKey(user.id, next) },
				token: function(next) { db.getUserToken(user.id, next) }
			}, next);
		},
		function(key_data, next) {
			var key = key_data.key;
			if (! key) return next(new Error("endpoint requires authentication"));
			var permissions = JSON.parse(key_data.token).permissions;
			var queries = {};
			if (permissions.indexOf('progression') > -1) {
				queries.account = function(next) { gw2.request('/v2/account', key, next) };
				queries.achievements = function(next) { gw2.request('/v2/account/achievements', key, next) };
			}
			if (permissions.indexOf('wallet') > -1) queries.wallet = function(next) { gw2.request('/v2/account/wallet', key, next) };
			if (permissions.indexOf('inventories') > -1) {
				queries.materials = function(next) { gw2.request('/v2/account/materials', key, next) };
				queries.bank = function(next) { gw2.request('/v2/account/bank', key, next) };
				queries.shared = function(next) { gw2.request('/v2/account/inventory', key, next) };
			}
			if (permissions.indexOf('characters') > -1) {
				queries.characters = function(next) {
					gw2.request('/v2/characters', key, (err, characters) => {
						if (err) return next(err);
						var char_funcs = characters.reduce((total, c) => {
							total[c] = function(next) {
								gw2.request('/v2/characters/'+encodeURIComponent(c), key, next);
							};
							return total;
						}, {});
						async.parallelLimit(char_funcs, 3, next);
					});
				}
			}
			if (permissions.indexOf('pvp') > -1) {
				queries.pvp = function(next) { gw2.request('/v2/pvp/stats', key, next) };
			}
			async.parallelLimit(queries, 5, next);
		}
	], callback);
}

function startPlaying(user, callback) {
	var session_name = session_prefix+':'+user.id;
	var time = new Date();
	async.waterfall([
		function(next) { db.getObject(session_name, next) },
		function(session, next) {
			if (session && session.stop && (time - new Date(session.stop.time) <= relog_window)) return next(null, session);
			session = { start: { time: time } };
			gatherData(user, (err, result) => {
				if (err) return next(err);
				session.start.data = result;
				next(null, session);
			});
		},
		function(session, next) { db.setObject(session_name, session, next); }
	], callback);
}

function stopPlaying(user, callback) {
	var session_name = session_prefix+':'+user.id;
	var time = new Date();
	async.waterfall([
		function(next) { db.getObject(session_name, next) },
		function(session, next) {
			if (! session) return next(new Error('no session'));
			session.stop = { time: time };
			gatherData(user, (err, result) => {
				if (err) return next(err);
				session.stop.data = result;
				next(null, session);
			});
		},
		function(session, next) { db.setObject(session_name, session, next); }
	], callback);
}

function checkUsers(users) {
	async.each(users, (user, next_user) => {
		if (! user.game) return next_user();
		if (user.game.name !== "Guild Wars 2") return next_user();
		startPlaying(user, next_user);
	});
}

function parseSession(user, callback) {
	var session_name = session_prefix+':'+user.id;
	async.waterfall([
		function(next) { db.getObject(session_name, next) },
		function(session, next) {
			if (! session) return next(new Error("no session"));
			if (session.stop) return next(null, session); // Complete session, nothing more to do
			// Session still in progress, gather the current data
			session.stop = { time: new Date() };
			gatherData(user, (err, result) => {
				if (err) return next(err);
				session.stop.data = result;
				next(null, session);
			});
		}
	], function(err, session) {
		if (err) return callback(err);
		if (! session.stop) return callback(new Error("no session stop"));
		var string = '';
		var time_in_ms = new Date(session.stop.time) - new Date(session.start.time);
		var time_in_mins = Math.round(time_in_ms / 60000);
		var sentences = [];
		sentences.push(phrases.get("SESSION_PLAYTIME", { minutes: time_in_mins }));
		if (! session.start.data) return callback(null, sentences.join("  "));
		// Rearrange some arrays into key/value pairs by id (makes it easier to diff)
		['start', 'stop'].forEach(t => {
			['wallet', 'achievements'].forEach(d => {
				if (! session[t].data[d]) return;
				session[t].data[d] = session[t].data[d].reduce((total, i) => {
					total[i.id] = i;
					return total;
				}, {});
			});
			// Total count of items (no matter where they are)
			session[t].data.all_items = {};
			['materials', 'bank', 'shared'].forEach(s => {
				if (! session[t].data[s]) return;
				session[t].data.all_items = session[t].data[s].reduce((total,i) => {
					if (!i) return total;
					if (i.binding) return total;
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
						if (i.binding) return;
						if (total[i.id]) total[i.id] += i.count;
						else total[i.id] = i.count;
					});
					return total;
				}, session[t].data.all_items);
			});
		});
		var differences = diff(session.start.data, session.stop.data);
		var wvw_stats = [];
		var pvp_stats = [];
		var new_achievements = [];
		var items_gained = [];
		var items_lost = [];
		var pvp_rank_ups = 0;
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
						var unrated_before = session.start.data.achievements['241'].current - session.start.data.achievements['265'].current;
						var unrated_after = session.stop.data.achievements['241'].current - session.stop.data.achievements['265'].current;
						var unrated_diff = unrated_after - unrated_before;
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
				var change;
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
		async.parallel({
			achievements: function(next) { gw2.getAchievements(new_achievements, next); },
			prices: function(next) { gw2.getPrices(items_gained.map(i => i.id).concat(items_lost.map(i => i.id)), next); }
		}, function(err, result) {
			if (err) return callback(err);
			var ach = result.achievements;
			var prices = result.prices;
			if (new_achievements.length > 0) sentences.push(phrases.get("SESSION_ACHIEVEMENTS", { count: new_achievements.length, list: new_achievements.map(a => ach[a].name).join(", ") }));
			if (items_gained.length > 0) {
				var value_gained = items_gained.reduce((t, i) => (t + (i.change * (prices[i.id] ? prices[i.id].buys.unit_price : 0))), 0);
				sentences.push(phrases.get("SESSION_ITEMS_GAINED", { count: items_gained.length, value: coinsToGold(value_gained) }));
			}
			if (items_lost.length > 0) {
				var value_lost = items_lost.reduce((t, i) => (t + (i.change * (prices[i.id] ? prices[i.id].buys.unit_price : 0))), 0);
				sentences.push(phrases.get("SESSION_ITEMS_LOST", { count: items_lost.length, value: coinsToGold(value_lost) }));
			}
			callback(null, sentences.join("  "));
		});
	});
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

function presenceChanged(oldState, newState) {
	var isPlaying  = (newState.game && newState.game.name === "Guild Wars 2");
	var wasPlaying = (oldState.game && oldState.game.name === "Guild Wars 2");
	if (isPlaying && ! wasPlaying) {
		// User started playing
		startPlaying(newState);
	}
	if (wasPlaying && ! isPlaying) {
		// User stopped playing
		stopPlaying(newState, (err) => {
			//parseSession(newState, (err, string) => { });
		});
		// Refresh data in 5 minutes to make sure we don't have old cached data
		setTimeout(function() {
			stopPlaying(newState, () => { });
		}, 305000);
	}
}

function messageReceived(message) {
	var cmd = new RegExp('^!'+phrases.get("SESSION_SHOWLAST")+'$', 'i');
	if (! message.content.match(cmd)) return;
	message.channel.startTyping(() => {
		parseSession(message.author, (err, string) => {
			if (err && err.message === "no session") string = phrases.get("SESSION_NO_SESSION");
			else if (err) {
				string = phrases.get("CORE_ERROR");
				console.log(err.message);
			}
			message.channel.stopTyping(() => { message.reply(string) });
		});
	});
}

module.exports = function(bot) {
	bot.on("ready", () => {
		checkUsers(bot.users);
	});
	bot.on("presence", presenceChanged);
	bot.on("message", messageReceived);
}
