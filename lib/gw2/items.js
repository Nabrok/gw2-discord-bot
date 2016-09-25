module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache('item', next) });
	api.onBuildChange(function(next) { api.clearCache('itemstats', next) });

	api.getItems = function(ids, callback) {
		api.useCache('/v2/items', ids, 'item', callback);
	};

	api.getItemStats = function(ids, callback) {
		api.useCache('/v2/itemstats', ids, 'itemstats', callback);
	};
};
