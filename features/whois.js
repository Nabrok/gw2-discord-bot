"use strict";
const
	Promise = require("bluebird"),
	db = Promise.promisifyAll(require("../lib/db")),
	phrases = require("../lib/phrases");

let bot_user;

function messageReceived(message) {
	const channel = message.channel;

	if (message.content.match(new RegExp(`^!${phrases.get("WHOIS_WHOIS")} (.*)?$`, "i"))) {
		if (message.mentions.users.length === 0) return; // No mentions? No answer
		const user = message.mentions.users.first();
		if (! user) return;
		channel.startTyping();
		var p;
		if (user.id === bot_user.id) p = message.reply(phrases.get("WHOIS_BOT", { user: bot_user }));
		else p = db.getAccountByUserAsync(user.id).then(account => {
			if (!account) throw new Error("unknown user");

			// Construct message
			if (user.id === message.author.id) return message.reply(phrases.get("WHOIS_SELF", { account_name: account.name }));
			else return message.reply(phrases.get("WHOIS_KNOWN", { user: user, account_name: account.name }));
		});
		p.catch(err => {
			// Capture errors and construct proper fail message
			switch (err.message) {
				case "unknown user":
					return phrases.get("WHOIS_UNKNOWN");
				default:
					console.log(`Error in whois command initiated by ${message.author.username}#${message.author.discriminator}: ${err.message}`);
					return;
			}
		}).then(() => channel.stopTyping());
	}
}

module.exports = bot => {
	bot.on("message", messageReceived);
	bot.on("ready", () => {
		bot_user = bot.user;
	})
};
