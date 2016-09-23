var async = require('async');

module.exports = function(api) {

	api.onBuildChange(function(next) { api.clearCache('wvw_objective', next) });

	api.getObjectives = function(ids, callback) {
		api.useCache('/v2/wvw/objectives', ids, 'wvw_objective', callback)
	};
};
