const cache_name = 'traits';

module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache(cache_name, next) });

	api.getTraits = function(ids, callback) {
		api.useCache('/v2/traits', ids, cache_name, callback);
	};
};
