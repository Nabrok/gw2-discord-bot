const cache_name = 'legends';

module.exports = function(api) {
	api.setMaxListeners(api.getMaxListeners() + 1);
	api.on('build change', () => api.clearCache(cache_name));

	api.getLegends = function(ids, callback) {
		api.useCache('/v2/legends', ids, cache_name, callback);
	};
};
