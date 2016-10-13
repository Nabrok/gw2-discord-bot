const cache_name = 'wvw_objective';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getObjectives = function(ids, callback) {
		return api.useCache('/v2/wvw/objectives', ids, cache_name, callback)
	};
};
