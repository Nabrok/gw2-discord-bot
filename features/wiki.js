"use strict";
const
	MWBot = require("mwbot"),
	Promise = require("bluebird"),
	config = require("config"),
	toMarkdown = require("to-markdown"),
	db = Promise.promisifyAll(require("../lib/db")),
	phrases = require("../lib/phrases");

const ttl = 1000 * 60 * 60; // Cache wiki responses for an hour to prevent flooding the wiki with requests with the same search terms
const wiki = new MWBot({
	apiUrl: "https://wiki.guildwars2.com/api.php"
});

function htmlToMessage(html) {
	return toMarkdown(html, {
		converters: [
			{ // Convert various stuff to plain-text
				filter: ["a", "small", "span"],
				replacement: (innerHTML, node) => node.style.display != "none" ? innerHTML : ""
			},
			{ // Filter out all unwanted tags
				filter: node => !node.nodeName.match(/^(b|strong|i|em|s|del|p)$/i),
				replacement: (innerHTML, node) => ""
			}
		]
	});
}

function messageReceived(message) {
	const messageAsync = Promise.promisifyAll(message);
	const channelAsync = Promise.promisifyAll(message.channel);

	let match;
	if (match = message.content.match(new RegExp(`^!${phrases.get("WIKI_WIKI")} ?(.*)?$`, "i"))) {
		const terms = match[1];
		channelAsync.startTypingAsync()
			.then(() => {
				if (!terms) throw new Error("no title");

				// Get cache if it exists
				return db.getCachedResponseAsync("wiki", terms).then(cache => {
					if (typeof cache === "string") return cache;

					// Only search if we have something to search for
					return wiki.request({
						action: "query",
						list: "search",
						srsearch: terms,
						srwhat: "nearmatch"
					});
				});
			})
			.then(response => {
				if (typeof response === "string") return response; // We got a cached response
				if (response.query.search.length > 0) return response; // We got a live response with results

				// The original nearmatch search didn't give us any results, proceed with title search
				return wiki.request({
					action: "query",
					list: "search",
					srsearch: terms,
					srwhat: "title"
				});
			})
			.then(response => {
				if (typeof response === "string") return response; // We got a cached response
				if (response.query.search.length === 0) throw new Error("not found"); // No results

				// We have found something, get the first page result
				return wiki.request({
					action: "parse",
					page: response.query.search[0].title,
					redirects: true,
					prop: "text"
				});
			})
			.catch(err => {
				// Make sure we have sane errors
				if (err.code === "missingtitle") throw new Error("not found");
				else if (err.info) throw new Error(err.info);
				throw err;
			})
			.then(response => {
				if (typeof response === "string") {
					// We got a cached response
					return response;
				} else if (response.parse.text["*"]) {
					// We got a live response
					let text = response.parse.text["*"];
					const title = response.parse.title;

					// Construct message
					text = htmlToMessage(text).split("\n")[0].trim();
					const url = encodeURI(`https://wiki.guildwars2.com/wiki/${title}`);
					if (text) text += "\n\n" + phrases.get("WIKI_MORE", { url });
					else text = phrases.get("WIKI_LINK", { title, url });

					// Cache it
					return db.saveCachedResponseAsync("wiki", terms, text, ttl).return(text);
				}
				throw new Error("not found"); // No results
			})
			.catch(err => {
				// Capture errors and construct proper fail message
				switch (err.message) {
					case "not found":
						const text = phrases.get("WIKI_NOT_FOUND");
						// Cache it
						return db.saveCachedResponseAsync("wiki", terms, text, ttl).return(text);
					case "no title":
						return phrases.get("WIKI_NO_TERM");
					default:
						console.log(`Error in wiki command initiated by ${message.author.username}#${message.author.discriminator}: ${err.message}`);
						return phrases.get("WIKI_ERROR", { error: err.message || "" });
				}
			})
			.finally(() => channelAsync.stopTypingAsync())
			.then(text => messageAsync.replyAsync(text));
	}
}

module.exports = bot => {
	bot.on("message", messageReceived);
};
