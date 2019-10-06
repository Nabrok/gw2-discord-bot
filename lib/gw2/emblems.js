const background_cache = 'emblem_background';
const foreground_cache = 'emblem_foreground';

module.exports = api => {
	api.onBuildChange(() => api.clearCache(background_cache));
	api.onBuildChange(() => api.clearCache(foreground_cache));

	api.getEmblemBackgrounds = ids => api.useCache('/v2/emblem/backgrounds', ids, background_cache);
	api.getEmblemForegrounds = ids => api.useCache('/v2/emblem/foregrounds', ids, foreground_cache);
};
