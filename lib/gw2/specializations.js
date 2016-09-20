var async = require('async');

const cache_name = 'specializations';

module.exports = function(api) {
	api.onBuildChange(function(next) { api.clearCache(cache_name, next) });

	api.getSpecializations = function(ids, callback) {
		api.useCache('/v2/specializations', ids, cache_name, callback);
	};
};
