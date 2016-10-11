const cache_name = 'wvw_objective';

module.exports = function(api) {
	api.setMaxListeners(api.getMaxListeners() + 1);
	api.on('build change', () => api.clearCache(cache_name));

	api.getObjectives = function(ids, callback) {
		api.useCache('/v2/wvw/objectives', ids, cache_name, callback)
	};
};
