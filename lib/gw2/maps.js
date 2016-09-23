var async = require('async');

module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache('map', next); });

	api.getMaps = function(map_ids, callback) {
		api.useCache('/v2/maps', map_ids, 'map', callback);
	};

	api.getMap = function(map_id, callback) {
		api.getMaps([map_id], function(err, maps) {
			callback(err, maps[map_id]);
		});
	};

	api.getMapNames = function(map_ids, callback) {
		api.getMaps(map_ids, function(err, maps) {
			var map_names = {};
			if (err || ! maps) return callback(err, map_names);
			Object.keys(maps).forEach(function(map_id) {
				map_names[map_id] = maps[map_id].name;
			});
			callback(null, map_names);
		});
	};
};
