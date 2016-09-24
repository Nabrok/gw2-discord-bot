var
	async = require('async'),
	request = require('request'),
	db = require('../db')
;

const default_ttl = 1000 * 60 * 5; // Cache responses for 5 minutes
const languages = ['en', 'es', 'de', 'fr', 'ko', 'zh'];

var timers = {};

var api = {};
api.language = "en";

api.hooks = {};
api.build_change_hooks = [];

api.setLanguage = function(lang) {
	if (languages.indexOf(lang) === -1) return;
	api.language = lang;
};

api.addHook = function(path, hook) {
	if (! Array.isArray(api.hooks[path])) api.hooks[path] = [];
	api.hooks[path].push(hook);
};

api.onBuildChange = function(hook) {
	api.build_change_hooks.push(hook);
};

api.request = function(path, key, callback, options) {
	if (! callback) callback = function() {};
	if (! path.match(/^\//)) path = '/'+path;
	if (! key) key = 0;
	if (! options) options = { };
	var ttl = options.ttl || default_ttl;
	var always_hook = options.always_hook || false;
	var expire_callback = options.expire_callback;
	db.getCachedResponse(path, key, function(err, cache) {
		if (cache) {
			if (always_hook && Array.isArray(api.hooks[path])) async.each(api.hooks[path], function(hook, next) { hook(cache, key, next); }, function(err) { callback(err, cache); });
			else callback(null, cache);
			return;
		}
		var options = {
			url: 'https://api.guildwars2.com'+path,
			json: true,
			timeout: 10000
		};
		if (key) options.headers = {
			Authorization: 'Bearer ' + key
		};
		request(options, function(error, http_res, result) {
			if (error) return callback(error);
			if (! http_res.statusCode.toString().match(/^[2|4]/)) return callback(new Error(http_res.statusCode));
			if (result.text) return callback(new Error(result.text));
			// Save result in cache
			db.saveCachedResponse(path, key, result, ttl, function(err) {
				if (expire_callback) setTimeout(function() {
					if (expire_callback) expire_callback(null, path, key);
				}, ttl + 100);
				// Call any hooks
				if (Array.isArray(api.hooks[path])) async.each(api.hooks[path], function(hook, next) { hook(result, key, next); }, function(err) { callback(err, result); });
				else callback(null, result);
			});
		});
	});
};

api.keepUpdated = function(path, key, frequency) {
	if (frequency < 5000) frequency = 5000; // 5 seconds absolute minimum
	var timer_key = path+':'+key;
	if (timers[timer_key] && timers[timer_key].frequency <= frequency) return; // already a more frequent timer

	var options = {};
	if (frequency < default_ttl) {
		options.ttl = frequency - 100;
	}

	// Task to be done, sets a new timer to call itself again when finished
	var thing_to_do = function() {
		api.request(path, key, function() {
			timers[timer_key].start = Date.now();
			timers[timer_key].timeout = setTimeout(thing_to_do, frequency);
		}, options);
	};

	var run_immediately = false;
	if (timers[timer_key]) {
		clearTimout(timers[timer_key].timeout); // clear previous timeout if there is one
		// if cache has expired since last call, run again
		var time_since_start = Date.now() - timers[timer_key].start;
		var ttl = options.ttl || default_ttl;
		if (time_since_start > ttl) run_immediately = true;
	}
	else run_immediately = true;

	var record = timers[timer_key] || {};
	record.frequency = frequency;
	record.start = Date.now();
	record.timeout = setTimeout(thing_to_do, frequency);
	timers[timer_key] = record;
	if (run_immediately) api.request(path, key, null, options);
};

api.clearCache = function(cache_name, callback) {
	async.parallel([
		async.apply(db.clearCache, cache_name),
		function(next) {
			async.each(languages, (lang, next_lang) => {
				db.clearCache(lang+':'+cache_name, next_lang);
			}, next);
		}
	], callback);
};

api.useCache = function(path, ids, cache_name, callback) {
	cache_name = api.language+':'+cache_name;
	// Retrieve item from cache, or API if not in cache
	async.series([
		async.apply(api.checkBuild),
		async.apply(db.getCacheKeys, cache_name)
	], function (err, result) {
		// Get ids we can from the db, get the rest from the API, and send them all back together
		var db_ids = result[1] || [];
		var to_get = [];
		var in_db = [];
		ids.forEach(function(i) {
			if (! i) return;
			if (to_get.indexOf(i) >= 0 || in_db.indexOf(i) >= 0) return;
			if (db_ids.indexOf(i.toString()) >= 0) {
				in_db.push(i);
			} else {
				to_get.push(i);
			}
		});
		if (to_get.length === 0 && in_db.length === 0) return callback(); // nothing to do
		var retrieve = {
			api: function(next) { next(null, []) },
			db: function(next) { next(null, []) }
		};
		if (to_get.length > 0) {
			var requests = [];
			while (to_get.length > 0) {
				var this_bit = to_get.splice(0, 200);
				requests.push(function(next) {
					api.request(path+'?ids='+this_bit.join(',')+'&lang='+api.language, null, (err, result) => {
						if (err && err.message === "all ids provided are invalid") return next(null, []);
						next(err, result);
					});
				});
			}
			retrieve.api = function(next) {
				async.parallel(requests, function(err, result) {
					if (err) return next(err);
					var all_results = result.reduce((t, r) => t.concat(r), []);
					next(null, all_results);
				});
			};
		}
		if (in_db.length > 0) {
			retrieve.db = async.apply(db.getCache, cache_name, in_db);
		}
		async.parallel(retrieve, function(err, result) {
			if (err) return callback(err);
			var return_items = {};
			async.series([
				function(next) {
					async.each(result.api, function(item, next) {
						if (! item) return next();
						return_items[item.id] = item;
						db.setCache(cache_name, item.id, item, next);
					}, next);
				},
				function(next) {
					async.each(result.db, function(item, next) {
						var response = JSON.parse(item);
						return_items[response.id] = response;
						next();
					}, next);
				}
			], function(err) {
				callback(err, return_items);
			});

		});
	});
};

api.checkBuild = function(callback, clear) {
	if (! callback) callback = function() { };
	async.parallel({
		gw_build: async.apply(api.request, '/v2/build', null),
		db_build: async.apply(db.getObject, 'gw2:build')
	}, function(err, result) {
		if (err) return callback(err);
		if (! result.db_build || parseInt(result.db_build.id) !== parseInt(result.gw_build.id) || clear) {
			db.setObject('gw2:build', result.gw_build, function(err, result) {
				async.each(api.build_change_hooks, function(hook, next) {
					hook(next);
				}, function(err) {
					callback(null, true);
				});
			});
		} else {
			callback(null, false);
		}
	});
};

api.splitCoins = function(coins) {
	var c = {
		gold: 0,
		silver: 0,
		copper: 0,
		html: ''
	};
	c.gold = Math.floor(coins / 10000);
	c.silver = Math.floor((coins - (c.gold * 10000)) / 100);
	c.copper = coins - (c.gold * 10000) - (c.silver * 100);
	if (c.gold) c.html += c.gold+' <img src="/plugins/nodebb-plugin-gw2/images/gold_coin.png" title="gold" /> ';
	if (c.silver) c.html += c.silver+' <img src="/plugins/nodebb-plugin-gw2/images/silver_coin.png" title="silver" /> ';
	if (c.copper) c.html += c.copper+' <img src="/plugins/nodebb-plugin-gw2/images/copper_coin.png" title="copper" />';

	return c;
};

api.formatText = function(text) {
	if (! text) return;
	return text
		.replace(/$/gm, "<br/>")
		.replace(/<c=@reminder>.+?<\/c>/g, function(reminder) {
			return reminder.replace(/<c=@reminder>/, '<span class="reminder">').replace(/<\/c>/, '</span>');
		})
		.replace(/<c=@flavor>.+?<\/c>/g, function(flavor) {
			return flavor.replace(/<c=@flavor>/, '<span class="flavor">').replace(/<\/c>/, '</span>');
		})
		.replace(/<c=@warning>.+?<\/c>/g, function(warning) {
			return warning.replace(/<c=@warning>/, '<span class="warning">').replace(/<\/c>/, '</span>');
		})
	;
}

api.formatTime = function(total_seconds) {
	var hours = Math.floor(total_seconds / 3600);
	var minutes = Math.floor((total_seconds - (hours * 3600)) / 60);
	var seconds = total_seconds - (hours * 3600) - (minutes * 60);
	var duration = '';
	if (hours) duration += hours + ' h ';
	if (minutes) duration += minutes + ' m ';
	if (seconds) duration += seconds + ' s';
	return duration.trim();
}

require('./worlds')(api);
require('./specializations')(api);
require('./traits')(api);
require('./objectives')(api);
require('./maps')(api);
require('./continents')(api);
require('./upgrades')(api);
require('./items')(api);
//require('./guild_details')(api, db);
require('./achievement_categories')(api);
require('./achievements')(api);
require('./pvp_seasons')(api);
require('./skills')(api);
require('./legends')(api);
require('./prices')(api);

module.exports = api;
