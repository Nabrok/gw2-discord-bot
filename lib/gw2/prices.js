var db = require('../db');

const cache_name = 'prices';

module.exports = function(api) {
	api.getPrices = function(ids, callback) {
		api.useCache('/v2/commerce/prices', ids, cache_name, function(err, prices) {
			if (err) return callback(err);
			// expire price data in 5 minutes
			db.expireCache(api.language+':'+cache_name, 300, () => {
				callback(null, prices);
			});
		});
	};
}
