var
	async = require('async'),
	db = require('../lib/db'),
	phrases = require('../lib/phrases')
;

var bot_user;

function messageReceived(message) {
	if (message.content.match(new RegExp('^!'+phrases.get("WHOIS_WHOIS")+' (.*)+$', 'i'))) {
		if (message.mentions.length === 0) return;
		var user = message.mentions[0];
		async.waterfall([
			function(next) { message.channel.startTyping(next); },
			function(something, next) {
				if (user.id === bot_user.id) return next('bot user');
				db.getAccountByUser(user.id, next);
			},
			function(account, next) { account ? next(null, account.name) : next('unknown'); }
		], function(err, result) {
			message.channel.stopTyping(function() {
				if (err) {
					switch (err) {
						case 'unknown':
							return message.reply(phrases.get("WHOIS_UNKNOWN"));
						case 'bot user':
							return message.reply(phrases.get("WHOIS_BOT", { user: bot_user.mention() }));
						default:
							return console.log(err.message);
					}
				} else if (result) {
					if (user.id === message.author.id) message.reply(phrases.get("WHOIS_SELF", { account_name: result }));
					else message.reply(phrases.get("WHOIS_KNOWN", { user: user.mention(), account_name: result }));
				} else {
					message.reply(phrases.get("WHOIS_UNKNOWN"));
				}
			});
		});
	}
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
	bot.on("ready", function() { bot_user = bot.user; })
};
