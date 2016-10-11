const cache_name = 'achievement_category';

module.exports = function(api) {
	api.setMaxListeners(api.getMaxListeners() + 1);
	api.on('build change', () => api.clearCache(cache_name));

	api.getAchievementCategories = function(ids, callback) {
		api.useCache('/v2/achievements/categories', ids, cache_name, callback);
	};
};
