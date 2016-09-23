const cache_name = 'skills';

module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache(cache_name, next) });

	api.getSkills = function(ids, callback) {
		api.useCache('/v2/skills', ids, cache_name, callback);
	};
};
