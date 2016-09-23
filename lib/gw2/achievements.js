module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache('achievement', next) });

	api.getAchievements = function(ids, callback) {
		api.useCache('/v2/achievements', ids, 'achievement', callback);
	};
};
