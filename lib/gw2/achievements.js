const cache_name = 'achievements';

module.exports = function(api) {
	api.setMaxListeners(api.getMaxListeners() + 1);
	api.on('build change', () => api.clearCache(cache_name));

	api.getAchievements = function(ids, callback) {
		api.useCache('/v2/achievements', ids, cache_name, callback);
	};
};
