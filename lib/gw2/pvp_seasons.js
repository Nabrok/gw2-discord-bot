const cache_name = 'pvp_season';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getPvPSeason = function(ids, callback) {
		return api.useCache('/v2/pvp/seasons', ids, cache_name, callback);
	};

	api.getAllPvPSeasons = function(callback) {
		var p = api.request('/v2/pvp/seasons')
		.then(season_ids => api.getPvPSeason(season_ids))
		.then(seasons => {
			var seasons_array = Object.keys(seasons).map(s => seasons[s]);
			return seasons_array;
		});
		if (callback) p.then(s => callback(null, s)).catch(err => callback(err));
		else return p;
	};
};
