const cache_name = 'achievement_category';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getAchievementCategories = function(ids, callback) {
		return api.useCache('/v2/achievements/categories', ids, cache_name, callback);
	};
};
