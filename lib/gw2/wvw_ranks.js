const cache_name = 'wvw_ranks';

module.exports = function(gw2) {
	gw2.onBuildChange(() => gw2.clearCache(cache_name));

	gw2.getWvwRanks = function(ids, callback) {
		return gw2.useCache('/v2/wvw/ranks', ids, cache_name, callback);
	};

	gw2.getWvwRankName = function(rank, callback) {
		if (! rank) return callback();
		var p = gw2.getAllWvwRanks()
		.then(all_ranks => {
			var sorted_ranks = all_ranks.sort((a,b) => a.min_rank - b.min_rank);
			var thisRank = sorted_ranks[sorted_ranks.findIndex(r => r.min_rank > rank) - 1];
			if (! thisRank) thisRank = sorted_ranks[sorted_ranks.length - 1];
			return thisRank.title;
		})
		if (callback) p.then(name => callback(null, name)).catch(err => callback(err));
		else return p;
	};

	gw2.getAllWvwRanks = function(callback) {
		var p = gw2.request('/v2/wvw/ranks')
		.then(rank_ids => gw2.getWvwRanks(rank_ids))
		.then(ranks => Object.keys(ranks).map(r => ranks[r]));
		if (callback) p.then(ranks => callback(null, ranks)).catch(err => callback(err));
		else return p;
	};
};
