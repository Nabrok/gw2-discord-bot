"use strict";
const
	db = require("../lib/database"),
	phrases = require("../lib/phrases");

let bot_user;

/**
 * 
 * @param {import('discord.js').Message} message 
 */
async function messageReceived(message) {
	const channel = message.channel;

	if (message.content.match(new RegExp(`^!${phrases.get("WHOIS_WHOIS")} (.*)?$`, "i"))) {
		if (message.mentions.users.length === 0) return; // No mentions? No answer
		const user = message.mentions.users.first();
		if (! user) return;
		channel.startTyping();
		try {
			if (user.id === bot_user.id) await message.reply(phrases.get("WHOIS_BOT", { user: bot_user }));
			else {
				const account = await db.getAccountByUser(user.id);
				if (! account) throw new Error("unknown user");

				if (user.id === message.author.id) await message.reply(phrases.get("WHOIS_SELF", { account_name: account.name }));
				else await message.reply(phrases.get("WHOIS_KNOWN", { user: user, account_name: account.name }));
			}
		} catch(err) {
			if (err.message === 'unknown user') {
				await message.reply(phrases.get("WHOIS_UNKNOWN"));
			} else {
				console.error(`Error in whois command initiated by ${message.author.username}#${message.author.discriminator}: ${err.message}`);
				await message.reply(phrases.get("CORE_ERROR"));
			}
		}
		channel.stopTyping();
	}
}

/**
 * @param {import('discord.js').Client} bot
 */
module.exports = bot => {
	bot.on("message", messageReceived);
	bot.on("ready", () => {
		bot_user = bot.user;
	});
};
