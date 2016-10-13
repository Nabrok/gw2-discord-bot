const cache_name = 'traits';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getTraits = function(ids, callback) {
		return api.useCache('/v2/traits', ids, cache_name, callback);
	};
};
