var
	async = require('async'),
	config = require('config'),
	MWBot = require('mwbot'),
	toMarkdown = require('to-markdown'),
	phrases = require('../lib/phrases')
;

var wiki = new MWBot({
	apiUrl: "https://wiki.guildwars2.com/api.php"
});

function htmlToMessage(html) {
	return toMarkdown(html, {
		converters: [
			{ // Convert various stuff to plain-text
				filter: ['a', 'small'],
				replacement: function(innerHTML, node) { return innerHTML; }
			},
			{ // Filter out all unwanted tags
				filter: function(node) {
					return !node.nodeName.match(/^(b|strong|i|em|s|del|p)$/i);
				},
				replacement: function(innerHTML, node) { return ""; }
			}
		]
	});
}

function messageReceived(message) {
	var match;
	if (match = message.content.match(new RegExp('^!'+phrases.get("WIKI_WIKI")+' ?(.*)?$', 'i'))) {
		async.waterfall([
			function(next) { message.channel.startTyping(next); },
			function(something, next) {
				var term = match[1];
				if (term) {
					wiki.request({
						action: 'query',
						list: 'search',
						srsearch: term,
						srwhat: 'nearmatch'
					}).then((response) => {
						if (response.query.search.length == 0) {
							return wiki.request({
								action: 'query',
								list: 'search',
								srsearch: term,
								srwhat: 'title'
							});
						}
						return response;
					}).then((response) => {
						if (response.query.search.length > 0) {
							return wiki.request({
								action: 'parse',
								page: response.query.search[0].title,
								redirects: true,
								prop: 'text'
							});
						}
						throw { code: 'missingtitle' };
					}).then((response) => {
						next(null, response);
					}).catch((error) => {
						if (error.code == "missingtitle") next(new Error("not found"));
						else next(new Error(error.info));
					});
				} else {
					next(new Error("no title"));
				}
			},
			function(response, next) {
				var text = response.parse.text['*'];
				if (text) {
					text = htmlToMessage(text).split("\n")[0].trim();
					var url = encodeURI("https://wiki.guildwars2.com/wiki/"+response.parse.title);
					if (text) text += "\n\n"+phrases.get("WIKI_MORE", { url: url });
					else text = phrases.get("WIKI_LINK", { title: response.parse.title, url: url });
					next(null, text);
				} else {
					next(new Error("not found"));
				}
			}
		], function(err, result) {
			message.channel.stopTyping(function() {
				if (err) {
					switch (err.message) {
						case "not found": return message.reply(phrases.get("WIKI_NOT_FOUND"));
						case "no title": return message.reply(phrases.get("WIKI_NO_TERM"));
						default: return message.reply(phrases.get("WIKI_ERROR", { error: err.message || "" }));
					}
				} else {
					message.reply(result);
				}
			});
		});
	}
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
};
