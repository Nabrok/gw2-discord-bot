var
	async = require('async'),
	db = require('../lib/db'),
	phrases = require('../lib/phrases'),
	gw2 = require('../lib/gw2')
;

function messageReceived(message) {
	if (! message.content.match(/^!(fractal level|wvw rank)$/)) return;
	async.waterfall([
		function(next) { message.channel.startTyping(next); },
		function(something, next) { db.getUserKey(message.author.id, next) },
		function(key, next) { if (! key) return next(); gw2.request('/v2/account', key, next) },
	], function(err, result) {
		message.channel.stopTyping(function() {
			if (! result) {
				message.reply(phrases.get("PROGRESSION_NO_KEY"));
				return;
			}
			switch (message.content) {
				case "!fractal level":
					message.reply(phrases.get("PROGRESSION_FRACTAL_LEVEL", { level: result.fractal_level }));
					break;
				case "!wvw rank":
					message.reply(phrases.get("PROGRESSION_WVW_RANK", { rank: result.wvw_rank }));
					break;
			}
		});
	});
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
}
