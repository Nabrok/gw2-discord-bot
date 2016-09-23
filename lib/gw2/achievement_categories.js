module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache('achievement_category', next) });

	api.getAchievementCategories = function(ids, callback) {
		api.useCache('/v2/achievements/categories', ids, 'achievement_category', callback);
	};
};
