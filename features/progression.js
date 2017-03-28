var
	Promise = require('bluebird'),
	db = Promise.promisifyAll(require('../lib/db')),
	phrases = require('../lib/phrases'),
	gw2 = require('../lib/gw2')
;

function messageReceived(message) {
	var fractal_cmd = phrases.get("PROGRESSION_FRACTAL");
	var wvw_cmd = phrases.get("PROGRESSION_WVW");
	if (! message.content.match(new RegExp('^!('+fractal_cmd+'|'+wvw_cmd+')$', 'i'))) return;
	message.channel.startTyping();
	db.checkKeyPermissionAsync(message.author.id, 'progression')
		.then(hasPerm => {
			if (! hasPerm) throw new Error("requires scope progression");
			return db.getUserKeyAsync(message.author.id);
		})
		.then(key => {
			if (! key) throw new Error("endpoint requires authentication");
			return gw2.request('/v2/account', key);
		})
		.then(account => {
			if (message.content.match(new RegExp('^!'+wvw_cmd+'$', 'i')))
				return gw2.getWvwRankName(account.wvw_rank)
					.then(rank_name => message.reply(phrases.get("PROGRESSION_WVW_RANK", { rank: account.wvw_rank, title: rank_name })));
			else if (message.content.match(new RegExp('^!'+fractal_cmd+'$', 'i')))
				return message.reply(phrases.get("PROGRESSION_FRACTAL_LEVEL", { level: account.fractal_level }));
		})
		.catch(err => {
			if (err.message === "endpoint requires authentication") return message.reply(phrases.get("CORE_NO_KEY"));
			if (err.message === "requires scope progression") return message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: 'progression' }));
			console.error('Error reading account progression: '+ err.message)
		})
		.finally(() => message.channel.stopTyping())
	;
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
}
