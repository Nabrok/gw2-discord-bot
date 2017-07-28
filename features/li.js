var
	Promise = require('bluebird'),
	db = Promise.promisifyAll(require('../lib/db')),
	gw2 = require('../lib/gw2'),
	phrases = require('../lib/phrases')
;

const li_id = 77302; // ID number for Legendary Insights

function countLI(user) {
	return Promise.all([db.getUserKeyAsync(user.id), db.getUserTokenAsync(user.id)])
	.then(result => {
		var key = result[0], token = result[1] ? JSON.parse(result[1]) : {};
		if (! key) throw new Error("endpoint requires authentication");
		var permissions = token.permissions || [];
		if (permissions.indexOf('inventories') === -1) throw new Error('inventories permission required');
		if (permissions.indexOf('characters') === -1) throw new Error('characters permission required');
		var queries = [];
		queries.push({ name: 'bank', promise: () => gw2.request('/v2/account/bank', key) });
		queries.push({ name: 'inventory', promise: () => gw2.request('/v2/account/inventory', key) });
		queries.push({ name: 'characters', promise: () => gw2.request('/v2/characters', key).then(characters => {
			var char_queries = characters.map(c => ({
				name: c,
				promise: () => gw2.request('/v2/characters/'+encodeURIComponent(c)+'/inventory', key)
			}));
			return Promise.map(char_queries, c => c.promise(), { concurrency: 3 });
		})});
		queries.push({ name: 'materials', promise: () => gw2.request('/v2/account/materials', key) });
		return Promise.map(queries, q => q.promise());
	})
	.then(result => {
		var bank = result[0], shared = result[1], characters = result[2], mats = result[3];
		var bank_insights = bank.filter(item => !!item && item.id === li_id).reduce((total, item) => { total += item.count; return total; }, 0);
		var shared_insights = shared.filter(item => !!item && item.id === li_id).reduce((total, item) => { total += item.count; return total; }, 0);
		var char_insights = characters.reduce((total, character) =>
			character.bags.filter(b => !!b).reduce((char_total, bag) =>
				bag.inventory.filter(i => !!i && i.id === li_id).reduce((bag_total, item) =>
					{ bag_total += item.count; return bag_total; }
				, char_total)
			, total)
		, 0);
		var mats_insights = mats.filter(item => !!item && item.id === li_id).reduce((total, item) => { total += item.count; return total; }, 0);
		return bank_insights + shared_insights + char_insights + mats_insights;
	});
}

function messageReceived(message) {
	var cmd = new RegExp('^!'+phrases.get("LI_CMD")+'$', 'i');
	if (! message.content.match(cmd)) return;
	message.channel.startTyping();
	countLI(message.author)
	.then(count => message.reply(phrases.get("LI_SHOW", { count })))
	.catch(err => {
		if (err.message === "endpoint requires authentication") return message.reply(phrases.get("CORE_NO_KEY"));
		if (err.message === "inventories permission required") return message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: 'inventories' }));
		if (err.message === "characters permission required") return message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: 'characters' }));
		console.error('Error checking LI count: '+err.message);
		return message.reply(phrases.get("CORE_ERROR"));
	})
	.then(() => message.channel.stopTyping());
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
}
