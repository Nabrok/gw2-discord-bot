var
	async = require('async')
;

module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache('guild_upgrade', next) });

	api.getUpgrades = function(ids, callback) {
		api.useCache('/v2/guild/upgrades', ids, 'guild_upgrade', callback);
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
