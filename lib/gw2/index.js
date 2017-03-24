var
	Promise = require('bluebird'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	async = require('async'),
	request = require('request'),
	db = Promise.promisifyAll(require('../db'))
;

const default_ttl = 1000 * 60 * 5; // Cache responses for 5 minutes
const languages = ['en', 'es', 'de', 'fr', 'ko', 'zh'];

var timers = {};

var api = function() {
	EventEmitter.call(this);

	this.language = "en";
	this.build_change_hooks = [];
}

util.inherits(api, EventEmitter);

api.prototype.setLanguage = function(lang) {
	if (languages.indexOf(lang) === -1) return;
	this.language = lang;
};

api.prototype.onBuildChange = function(hook) {
	this.build_change_hooks.push(hook);
};

api.prototype.request = function(path, key, callback, options) {
	var self = this;
	if (! path.match(/^\//)) path = '/'+path;
	if (! key) key = 0;
	if (! options) options = { };
	var ttl = options.ttl || default_ttl;
	var always_hook = options.always_hook || false;
	var promise = db.getCachedResponseAsync(path, key)
		.then(cache => {
			if (cache) {
				self.emit(path, cache, key, true);
				return cache;
			}
			return new Promise((resolve, reject) => {
				var options = {
					url: 'https://api.guildwars2.com'+path,
					json: true,
					timeout: 10000
				};
				if (key) options.headers = {
					Authorization: 'Bearer ' + key
				};
				request(options, function(error, http_res, result) {
					if (error) return reject(error);
					if (! http_res.statusCode.toString().match(/^[2|4]/)) return reject(new Error(http_res.statusCode));
					if (result.text) return reject(new Error(result.text));
					if (result.error) return reject(new Error(result.error));
					var expires = http_res.headers.expires;
					if (expires)
						ttl = new Date(expires) - new Date();
					if (ttl < 100) ttl = 100;
					resolve(result);
				});
			}).then((result) => {
				return db.saveCachedResponseAsync(path, key, result, ttl)
					.then(() => {
						self.emit(path, result, key, false);
						return result;
					})
				;
			});
		})
	;
	if (callback) {
		promise
		.catch(err => { callback(err); throw(err) })
		.then(result => callback(null, result))
	} else {
		return promise;
	}
};

api.prototype.keepUpdated = function(path, key, frequency) {
	var self = this;
	if (frequency < 5000) frequency = 5000; // 5 seconds absolute minimum
	var timer_key = path+':'+key;
	if (timers[timer_key] && timers[timer_key].frequency <= frequency) return; // already a more frequent timer

	var options = {};
	if (frequency < default_ttl) {
		options.ttl = frequency - 100;
	}

	// Task to be done, sets a new timer to call itself again when finished
	var thing_to_do = function() {
		self.request(path, key, null, options).then(() => {
			timers[timer_key].start = Date.now();
			timers[timer_key].timeout = setTimeout(thing_to_do, frequency);
		})
		.catch(e => {
			if (e.message === 'access restricted to guild leaders') {
				clearTimeout(timers[timer_key].timeout);
			}
			console.error(`Problem retrieving ${path}: ${e.message}`);
		});
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
	if (run_immediately) this.request(path, key, null, options).catch(e => {
		if (e.message === 'access restricted to guild leaders') {
			clearTimeout(timers[timer_key].timeout);
		}
		console.error(`Problem retrieving ${path}: ${e.message}`);
	});
};

api.prototype.clearCache = function(cache_name, callback) {
	var promise = Promise.all(
		[db.clearCacheAsync(cache_name)]
		.concat(languages.map(l => db.clearCacheAsync(l+':'+cache_name)))
	);
	if (callback) {
		promise.then(result => callback(null, result)).catch(err => callback(err));
	} else {
		return promise;
	}
};

api.prototype.useCache = function(path, ids, cache_name, callback) {
	var self = this;
	cache_name = this.language+':'+cache_name;
	// Retrieve item from cache, or API if not in cache
	var promise = this.checkBuild()
		.then(() => db.getCacheKeysAsync(cache_name))
		.then(db_ids => {
			var to_get = [];
			var in_db = [];
			ids.forEach(i => {
				if (! i) return;
				if (to_get.indexOf(i) >= 0 || in_db.indexOf(i) >= 0) return;
				if (db_ids.indexOf(i.toString()) >= 0) {
					in_db.push(i);
				} else {
					to_get.push(i);
				}
			});
			if (to_get.length === 0 && in_db.length === 0) return {}; // nothing to do
			var retrieve = [];
			if (to_get.length > 0) {
				var requests = [];
				while (to_get.length > 0) {
					var this_bit = to_get.splice(0, 200);
					requests.push(self.request(path+'?ids='+this_bit.join(',')+'&lang='+self.language).catch((err) => {
						if (err.message === "all ids provided are invalid") return [];
						else throw(err);
					}));
				}
				retrieve.push(Promise.all(requests).then(results => results.reduce((t,a) => t.concat(a), [])));
			} else {
				retrieve.push([]);
			}
			if (in_db.length > 0) {
				retrieve.push(db.getCacheAsync(cache_name, in_db));
			} else {
				retrieve.push([]);
			}
			return Promise.all(retrieve).then(result => {
				var api_res = result[0], db_res = result[1];
				var return_items = {};
				db_res.forEach(item => {
					var response = JSON.parse(item);
					return_items[response.id] = response;
				});
				return Promise.all(api_res.filter(item => !!item).map(item => {
					return_items[item.id] = item;
					return db.setCacheAsync(cache_name, item.id, item)
				})).then(() => return_items);
			});
		})
	;

	if (callback) {
		promise.then(result => callback(null, result)).catch(err => callback(err));
	} else {
		return promise;
	}
};

api.prototype.checkBuild = function(callback, clear) {
	//var self = this;
	var promise = Promise.all([
		this.request('/v2/build'),
		db.getObjectAsync('gw2:build')
	]).then((build_versions) => {
		var gw_build = build_versions[0], db_build = build_versions[1];
		if (! db_build || parseInt(db_build.id) !== parseInt(gw_build.id) || clear) {
			return db.setObjectAsync('gw2:build', gw_build)
			.then(() => Promise.all(this.build_change_hooks.map(f => f())))
			.then(() => {
				this.emit('build change');
				return true;
			});
			return false;
		}
	});
	if (callback) {
		promise.then(result => callback(null, result)).catch(err => callback(err));
	} else {
		return promise;
	}
};

api.prototype.splitCoins = function(coins) {
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

api.prototype.formatText = function(text) {
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

api.prototype.formatTime = function(total_seconds) {
	var hours = Math.floor(total_seconds / 3600);
	var minutes = Math.floor((total_seconds - (hours * 3600)) / 60);
	var seconds = total_seconds - (hours * 3600) - (minutes * 60);
	var duration = '';
	if (hours) duration += hours + ' h ';
	if (minutes) duration += minutes + ' m ';
	if (seconds) duration += seconds + ' s';
	return duration.trim();
}

var gw2 = new api();

require('./worlds')(gw2);
require('./specializations')(gw2);
require('./traits')(gw2);
require('./objectives')(gw2);
require('./maps')(gw2);
require('./continents')(gw2);
require('./upgrades')(gw2);
require('./items')(gw2);
//require('./guild_details')(api, db);
require('./achievement_categories')(gw2);
require('./achievements')(gw2);
require('./pvp_seasons')(gw2);
require('./skills')(gw2);
require('./legends')(gw2);
require('./prices')(gw2);
require('./wvw_ranks')(gw2);

module.exports = gw2;
