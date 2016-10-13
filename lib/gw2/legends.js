const cache_name = 'legends';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getLegends = function(ids, callback) {
		return api.useCache('/v2/legends', ids, cache_name, callback);
	};
};
