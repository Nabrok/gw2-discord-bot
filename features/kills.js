var
	Promise = require('bluebird'),
	db = require('../lib/database'),
	gw2 = require('../lib/gw2'),
	phrases = require('../lib/phrases')
;

function getRaids(user) {
	return Promise.all([
		db.getUserKey(user.id),
		db.getUserToken(user.id)
	])
		.then(result => {
			var key = result[0], token = result[1] ? result[1] : {};
			if (! key) throw new Error("endpoint requires authentication");
			var permissions = token.permissions || [];
			if (permissions.indexOf('progression') === -1) throw new Error('progression permission required');
			return Promise.all([
				gw2.request('/v2/raids', key)
					.then(raids => {
						var queries = [];
						raids.forEach(function(id) {
							queries.push({ name: id, promise: () => gw2.request('/v2/raids/'+id, key) });
						});
						return Promise.map(queries, q => q.promise());
					}) ,

				gw2.request('/v2/account/raids', key)
			]);
		})
	// ])
		.then(result => {
			var out=phrases.get("KILLS_REPLY");
			var raids=result[0], kills=result[1];
			raids.forEach(function(item) {
				out += '**__' + item.id + '__**' + "\n";
				item.wings.forEach(function(wing) {
					out += "\t__" + wing.id + " :__ \n";
					wing.events.forEach(function(evt) {
						out += "\t\t" + (kills.indexOf(evt.id) > -1 ? '~~':'')+ evt.id +(kills.indexOf(evt.id) > -1 ? '~~':'')+ "\n";
					});
				});
			});
			return out;
		});
}

function messageReceived(message) {
	var cmd = new RegExp('^!' + phrases.get('KILLS_KILLS') + '$', 'i');
	if (! message.content.match(cmd)) return;
	message.channel.startTyping();
	getRaids(message.author)
		.then(res => message.reply(res))
		.catch((err) => {
			if (err.message === "endpoint requires authentication") return message.reply(phrases.get("CORE_NO_KEY"));
			if (err.message === "progression permission required") return message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: 'progression' }));
			console.error(err.stack);
			return message.reply(phrases.get("CORE_ERROR"));
		})
		.then(() => message.channel.stopTyping());

}

module.exports = function(bot) {
	bot.on("message", messageReceived);
};
