const cache_name = 'continent';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getContinents = function(ids, callback) {
		return api.useCache('/v2/continents', ids, cache_name, callback);
	};

	api.getContinent = function(id, callback) {
		var p = api.getContinents([id]).then(continents => continents[id]);
		if (callback) p.then(c => callback(null, c)).catch(err => callback(err));
		else return p;
	};
};
