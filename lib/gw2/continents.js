const cache_name = 'continent';

module.exports = function(api) {
	api.setMaxListeners(api.getMaxListeners() + 1);
	api.on('build change', () => api.clearCache(cache_name));

	api.getContinents = function(ids, callback) {
		api.useCache('/v2/continents', ids, cache_name, callback);
	};

	api.getContinent = function(id, callback) {
		api.getContinents([id], function(err, continents) {
			callback(err, continents[id]);
		});
	};
};
