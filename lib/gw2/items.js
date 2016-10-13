const item_cache = 'item';
const stats_cache = 'itemstats';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(item_cache));
	api.onBuildChange(() => api.clearCache(stats_cache));

	api.getItems = function(ids, callback) {
		return api.useCache('/v2/items', ids, item_cache, callback);
	};

	api.getItemStats = function(ids, callback) {
		return api.useCache('/v2/itemstats', ids, stats_cache, callback);
	};
};
