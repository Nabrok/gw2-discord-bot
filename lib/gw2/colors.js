const cache = 'color';

module.exports = api => {
	api.onBuildChange(() => api.clearCache(cache));

	api.getColors = ids => api.useCache('/v2/colors', ids, cache);
};
