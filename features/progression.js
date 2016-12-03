var
	async = require('async'),
	db = require('../lib/db'),
	phrases = require('../lib/phrases'),
	gw2 = require('../lib/gw2')
;

function messageReceived(message) {
	var fractal_cmd = phrases.get("PROGRESSION_FRACTAL");
	var wvw_cmd = phrases.get("PROGRESSION_WVW");
	if (! message.content.match(new RegExp('^!('+fractal_cmd+'|'+wvw_cmd+')$', 'i'))) return;
	async.waterfall([
		function(next) { message.channel.startTyping(next); },
		function(something, next) { db.checkKeyPermission(message.author.id, 'progression', next) },
		function(hasPerm, next) {
			if (! hasPerm) next(new Error("requires scope progression"));
			else next();
		},
		function(next) { db.getUserKey(message.author.id, next) },
		function(key, next) { if (! key) return next(); gw2.request('/v2/account', key, next) },
		function(result, next) {
			if (message.content.match(new RegExp('^!'+wvw_cmd+'$', 'i')))
				gw2.getWvwRankName(result.wvw_rank).then(rank_name => {
					result.wvw_rank_name = rank_name;
					next(null, result);
				});
			else
				next(null, result);
		}
	], function(err, result) {
		message.channel.stopTyping(function() {
			if (err) {
				if (err.message === "endpoint requires authentication") message.reply(phrases.get("CORE_NO_KEY"));
				if (err.message === "requires scope progression") message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: 'progression' }));
				else {
					message.reply(phrases.get("CORE_ERROR"));
					console.log(err.message);
				}
				return;
			}
			if (! result) {
				message.reply(phrases.get("CORE_NO_KEY"));
				return;
			}
			if (message.content.match(new RegExp('^!'+fractal_cmd+'$', 'i')))
					message.reply(phrases.get("PROGRESSION_FRACTAL_LEVEL", { level: result.fractal_level }));
			else if (message.content.match(new RegExp('^!'+wvw_cmd+'$', 'i')))
					message.reply(phrases.get("PROGRESSION_WVW_RANK", { rank: result.wvw_rank, title: result.wvw_rank_name }));
		});
	});
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
}
