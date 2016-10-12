var async = require('async');

module.exports = function(gw2) {
	gw2.onBuildChange(() => gw2.clearCache('world'));

	gw2.getWorlds = function(ids, callback) {
		api.useCache('/v2/worlds', ids, 'world', callback);
	};

	gw2.getWorldName = function(world_id, callback) {
		if (! world_id) return callback();
		api.getWorlds([world_id], function(err, result) {
			if (err) return callback(err);
			if (! result[world_id]) return callback(new Error('World '+world_id+' not found.'));
			callback(null, result[world_id].name);
		});
	};

	gw2.getAllWorlds = function(callback) {
		api.request('/v2/worlds', null, function(err, world_ids) {
			if (err) return callback(err);
			api.getWorlds(world_ids, function(err, worlds) {
				if (err) return callback(err);
				var worlds_array = [];
				Object.keys(worlds).forEach(function(w) { worlds_array.push(worlds[w]) });
				callback(null, worlds_array);
			});
		});
	};
};
