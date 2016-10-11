const cache_name = 'traits';

module.exports = function(api) {
	api.setMaxListeners(api.getMaxListeners() + 1);
	api.on('build change', () => api.clearCache(cache_name));

	api.getTraits = function(ids, callback) {
		api.useCache('/v2/traits', ids, cache_name, callback);
	};
};
