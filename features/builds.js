var
	async = require('async'),
	db = require('../lib/db'),
	phrases = require('../lib/phrases'),
	gw2 = require('../lib/gw2')
;

function messageReceived(message) {
	if (message.content.match(new RegExp('^!'+phrases.get("CORE_HELP")+'$', 'i'))) {
		message.author.sendMessage(phrases.get("BUILDS_HELP"));
		return;
	}
	var cmd = new RegExp('^!'+phrases.get("BUILDS_BUILD")+' (.+?)\s*(pve|wvw|pvp)?$', 'i');
	var matches = message.content.match(cmd);
	if (! matches) return;
	var character = matches[1];
	var type = matches[2] || "pve"; // Default to PvE
	type = type.toLowerCase();
	var user_key;
	async.waterfall([
		function(next) { message.channel.startTyping(next); },
		function(something, next) { db.getUserKey(message.author.id, next) },
		function(key, next) {
			// Get a list of characters first
			if (! key) return next(new Error("endpoint requires authentication"));
			user_key = key;
			gw2.request('/v2/characters/', key, next);
		},
		function(characters, next) {
			// We want it to be case insensitive, so find the correct case for the name given
			var name = characters.filter(c => c.toLowerCase() === character.toLowerCase())[0];
			if (! name) return next(new Error("no such character"));
			// Then request the specializations for that characetr
			gw2.request('/v2/characters/'+encodeURIComponent(name)+'/specializations', user_key, next);
		},
		function(result, next) {
			var specs = result.specializations[type].filter(s => !!s);
			// Get the specialization and trait ids while filtering out null values
			var spec_ids = specs.map(s => s.id);
			var trait_ids = specs.reduce((all_traits, s) => all_traits.concat(s.traits.filter(t => !!t)), []);
			async.parallel({
				specs: function(next) { gw2.getSpecializations(spec_ids, next) },
				traits: function(next) { gw2.getTraits(trait_ids, next) }
			}, function(err, details) {
				if (err) return next(err);
				// Form the output string
				string = specs.map(s => 
					details.specs[s.id].name + ': ' + s.traits.filter(t => !!t).map(t => details.traits[t].name).join(", ")
				).join("\n");
				next(null, string);
			});
		}
	], function(err, result) {
		message.channel.stopTyping(function() {
			if (err) {
				if (err.message === "endpoint requires authentication") message.reply(phrases.get("CORE_NO_KEY"));
				else if (err.message === "requires scope characters") message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: 'characters' }));
				else if (err.message === "requires scope builds") message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: 'builds' }));
				else if (err.message === "no such character") message.reply(phrases.get("BUILDS_NO_CHARACTER", { name: character }));
				else console.log(err.message);
				return;
			}
			message.reply("```\n"+result+"```");
		});
	});
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
}
