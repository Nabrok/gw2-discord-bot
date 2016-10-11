const cache_name = 'guild_upgrade';

module.exports = function(api) {
	api.setMaxListeners(api.getMaxListeners() + 1);
	api.on('build change', () => api.clearCache(cache_name));

	api.getUpgrades = function(ids, callback) {
		api.useCache('/v2/guild/upgrades', ids, cache_name, callback);
	};

	api.getAllUpgrades = function(callback) {
		api.request('/v2/guild/upgrades', null, function(err, upgrade_ids) {
			if (err) return callback(err);
			api.getUpgrades(upgrade_ids, function(err, upgrades) {
				if (err) return callback(err);
				var upgrades_array = [];
				Object.keys(upgrades).forEach(function(u) { upgrades_array.push(upgrades[u]) });
				callback(null, upgrades_array);
			});
		});
	};
};
