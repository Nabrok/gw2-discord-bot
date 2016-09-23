module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache('item', next) });

	api.getItems = function(ids, callback) {
		api.useCache('/v2/items', ids, 'item', callback);
	};
};
