const cache_name = 'legends';

module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache(cache_name, next) });

	api.getLegends = function(ids, callback) {
		api.useCache('/v2/legends', ids, cache_name, callback);
	};
};
