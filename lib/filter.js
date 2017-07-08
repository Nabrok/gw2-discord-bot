var
	config = require('config'),
	phrases = require('./phrases')
;

var filter = {};

var listenChannel = config.has('discord.channel') ? config.get('discord.channel') : "";

filter.filterChannel = function(message) {
	if (message.channel.type !== "text") return;
	if (listenChannel && listenChannel !== message.channel.name) {
		message.author.sendMessage(phrases.get("CORE_WRONG_CHANNEL", {channel: listenChannel}));
		return true;
	}
	return false;
}

module.exports = filter;
