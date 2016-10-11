const cache_name = 'skills';

module.exports = function(api) {
	api.setMaxListeners(api.getMaxListeners() + 1);
	api.on('build change', () => api.clearCache(cache_name));

	api.getSkills = function(ids, callback) {
		api.useCache('/v2/skills', ids, cache_name, callback);
	};
};
