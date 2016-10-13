var async = require('async');

module.exports = function(gw2) {
	gw2.onBuildChange(() => gw2.clearCache('world'));

	gw2.getWorlds = function(ids, callback) {
		return api.useCache('/v2/worlds', ids, 'world', callback);
	};

	gw2.getWorldName = function(world_id, callback) {
		if (! world_id) return callback();
		var p = api.getWorlds([world_id])
		.then(result => {
			if (! result[world_id]) throw new Error('World '+world_id+' not found.');
			return result[world_id].name;
		})
		if (callback) p.then(name => callback(null, name)).catch(err => callback(err));
		else return p;
	};

	gw2.getAllWorlds = function(callback) {
		var p = api.request('/v2/worlds')
		.then(world_ids => api.getWorlds(world_ids))
		.then(worlds => Object.keys(worlds).map(w => worlds[w]));
		if (callback) p.then(worlds => callback(null, worlds)).catch(err => callback(err));
		else return p;
	};
};
