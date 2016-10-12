const cache_name = 'pvp_season';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getPvPSeason = function(ids, callback) {
		api.useCache('/v2/pvp/seasons', ids, cache_name, callback);
	};

	api.getAllPvPSeasons = function(callback) {
		api.request('/v2/pvp/seasons', null, function(err, season_ids) {
			if (err) return callback(err);
			api.getPvPSeason(season_ids, function(err, seasons) {
				if (err) return callback(err);
				var seasons_array = [];
				Object.keys(seasons).forEach(function(s) { seasons_array.push(seasons[s]) });
				callback(null, seasons_array);
			});
		});
	};
};
