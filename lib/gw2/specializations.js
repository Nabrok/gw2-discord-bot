var async = require('async');

const cache_name = 'specializations';

module.exports = function(api) {
	api.onBuildChange(() => api.clearCache(cache_name));

	api.getSpecializations = function(ids, callback) {
		return api.useCache('/v2/specializations', ids, cache_name, callback);
	};
};
