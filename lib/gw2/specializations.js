var async = require('async');

const cache_name = 'specializations';

module.exports = function(api) {
	api.on('build change', () => api.clearCache('world'));

	api.getSpecializations = function(ids, callback) {
		api.useCache('/v2/specializations', ids, cache_name, callback);
	};
};
