const cache_name = 'map';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getMaps = function(map_ids, callback) {
		return api.useCache('/v2/maps', map_ids, cache_name, callback);
	};

	api.getMap = function(map_id, callback) {
		var p = api.getMaps([map_id]).then(maps => maps[map_id]);
		if (callback) p.then(map => callback(null, map)).catch(err => callback(err));
		else return p;
	};

	api.getMapNames = function(map_ids, callback) {
		var p = api.getMaps(map_ids).then(maps => {
			var map_names = {};
			if (! maps) return map_names;
			Object.keys(maps).forEach(function(map_id) {
				map_names[map_id] = maps[map_id].name;
			});
			return map_names;
		});
		if (callback) p.then(names => callback(null, names)).catch(err => callback(err));
		else return p;
	};
};
