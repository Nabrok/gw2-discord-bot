const cache_name = 'guild_upgrade';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getUpgrades = function(ids, callback) {
		return api.useCache('/v2/guild/upgrades', ids, cache_name, callback);
	};

	api.getAllUpgrades = function(callback) {
		var p = api.request('/v2/guild/upgrades')
		.then(upgrade_ids => api.getUpgrades(upgrade_ids))
		.then(upgrades => Object.keys(upgrades).map(u => upgrades[u]));
		if (callback) p.then(u => callback(null, u)).catch(err => callback(err));
		else return p;
	};
};
