var
	Promise = require('bluebird'),
	db = Promise.promisifyAll(require('../db'))
;

const cache_name = 'prices';

module.exports = function(api) {
	api.getPrices = function(ids, callback) {
		var p = api.useCache('/v2/commerce/prices', ids, cache_name).then(prices => db.expireCacheAsync(api.language+':'+cache_name, 300).then(() => prices));
		if (callback) {
			p.then(prices => callback(null, prices)).catch(err => callback(err));
		} else {
			return p;
		}
	};
}
