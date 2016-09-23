var async = require('async');

module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache('continent', next); });

	api.getContinents = function(ids, callback) {
		api.useCache('/v2/continents', ids, 'continent', callback);
	};

	api.getContinent = function(id, callback) {
		api.getContinents([id], function(err, continents) {
			callback(err, continents[id]);
		});
	};
};
