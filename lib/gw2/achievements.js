const cache_name = 'achievements';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getAchievements = function(ids, callback) {
		return api.useCache('/v2/achievements', ids, cache_name, callback);
	};
};
