var
	async = require('async'),
	db = require('../lib/db'),
	phrases = require('../lib/phrases'),
	gw2 = require('../lib/gw2')
;

function messageReceived(message) {
	var traits_cmd = new RegExp('^!('+phrases.get("BUILDS_BUILD")+') (.+?)(?:\\s+(pve|wvw|pvp))?$', 'i');
	var equip_cmd = new RegExp('^!('+phrases.get("BUILDS_EQUIP")+') (.+)$', 'i');
	var matches = message.content.match(traits_cmd) || message.content.match(equip_cmd);;
	if (! matches) return;
	var cmd = matches[1];
	var character = matches[2].trim();
	var type = matches[3] || "pve"; // Default to PvE
	type = type.toLowerCase();
	var user_key;
	async.waterfall([
		function(next) { message.channel.startTyping(next); },
		function(something, next) { db.getUserKey(message.author.id, next) },
		function(key, next) {
			if (! key) return next(new Error("endpoint requires authentication"));
			var permissions_needed = ['characters'];
			if (cmd === phrases.get("BUILDS_BUILD")) permissions_needed.push("builds");
			if (cmd === phrases.get("BUILDS_EQUIP")) permissions_needed.push("inventories");
			db.checkKeyPermission(message.author.id, permissions_needed, function(err, hasPerm) {
				if (! hasPerm) return next(new Error("requires scope "+permissions_needed.join(" and ")));
				next(null, key);
			});
		},
		function(key, next) {
			// Get a list of characters first
			user_key = key;
			gw2.request('/v2/characters/', key, next);
		},
		function(characters, next) {
			// We want it to be case insensitive, so find the correct case for the name given
			var name = characters.filter(c => c.toLowerCase() === character.toLowerCase())[0];
			if (! name) return next(new Error("no such character"));
			// Then request the specializations for that characetr
			gw2.request('/v2/characters/'+encodeURIComponent(name), user_key, next);
		},
		function(result, next) {
			if (cmd === phrases.get("BUILDS_BUILD")) {
				var specs = result.specializations[type].filter(s => !!s);
				var skills = result.skills[type];
				// Get the specialization and trait ids while filtering out null values
				var spec_ids = specs.map(s => s.id);
				var trait_ids = specs.reduce((all_traits, s) => all_traits.concat(s.traits.filter(t => !!t)), []);
				var skill_function;
				if (skills.legends) {
					skill_function = function(next) {
						gw2.getLegends(skills.legends, function(err, legends) {
							if (err) return next(err);
							var skill_ids = Object.keys(legends).map(l => legends[l].swap);
							gw2.getSkills(skill_ids, next);
						});
					}
				} else {
					var skill_ids = [ skills.heal, skills.elite ].concat(skills.utilities).filter(s => !!s);
					skill_function = function(next) { gw2.getSkills(skill_ids, next) };
				}
				async.parallel({
					specs: function(next) { gw2.getSpecializations(spec_ids, next) },
					traits: function(next) { gw2.getTraits(trait_ids, next) },
					skills: skill_function
				}, function(err, details) {
					if (err) return next(err);
					// Form the output string
					var traits_text = phrases.get("BUILDS_TRAITS");
					var string = "```"+result.name+": "+result.level+" "+result.profession+"```\n";
					string += "**__"+traits_text+"__**\n\n"; //+(Array(traits_text.length + 1).join("="))+"\n\n";
					string += specs.map(s =>
						details.specs[s.id].name + ': ' + s.traits.filter(t => !!t).map(t => details.traits[t].name).join(", ")
					).join("\n");
					if (skills.legends) {
						var legends_text = phrases.get("BUILDS_LEGENDS");
						string += "\n\n**__"+legends_text+"__**\n\n"; //+(Array(legends_text.length + 1).join("="))+"\n\n";
						string += Object.keys(details.skills).map(s => details.skills[s].name).join(", ")+"\n";
					} else {
						var skills_text = phrases.get("BUILDS_SKILLS");
						string += "\n\n**__"+skills_text+"__**\n\n"; //+(Array(skills_text.length + 1).join("="))+"\n\n";
						var utils = skills.utilities.filter(s => !!s);
						if (skills.heal) string += phrases.get("BUILDS_HEAL")+": "+details.skills[skills.heal].name+"\n";
						if (utils.length > 0) string += phrases.get("BUILDS_UTILITIES")+": "+utils.map(s => details.skills[s].name).join(", ")+"\n";
						if (skills.elite) string += phrases.get("BUILDS_ELITE")+": "+details.skills[skills.elite].name+"\n";
					}
					next(null, string);
				});
			}
			else if (cmd === phrases.get("BUILDS_EQUIP")) {
				var gear_ids = result.equipment.map(e => e.id);
				var upgrade_ids = result.equipment.filter(e => e.upgrades).reduce((t, u) => t.concat(u.upgrades), []);
				async.waterfall([
					function(next) { gw2.getItems(gear_ids.concat(upgrade_ids), next) },
					function(items, next) {
						var infix_ids = Object.keys(items).filter(i => (items[i].details && items[i].details.infix_upgrade)).map(i => items[i].details.infix_upgrade.id);
						infix_ids = infix_ids.concat(result.equipment.filter(e => e.stats).map(e => e.stats.id));
						gw2.getItemStats(infix_ids, function(err, itemstats) {
							if (err) return next(err);
							next(null, { items: items, itemstats: itemstats });
						});
					}
				], function(err, details) {
					if (err) return next(err);
					var gear_hash = result.equipment.reduce((t, e) => {
						t[e.slot] = e;
						return t;
					}, {});
					var string = "```"+result.name+": "+result.level+" "+result.profession+"```\n";
					var format = function(slot) {
						if (! gear_hash[slot]) return;
						var gear = gear_hash[slot];
						var item = details.items[gear.id];
						var itemstats = gear.stats ? details.itemstats[gear.stats.id] : item.details.infix_upgrade ? details.itemstats[item.details.infix_upgrade.id] : { name: '*not selected*' };
						if (! itemstats) itemstats = { name: '*unknown*' };
						string += (item.details.type || item.type)+": "+item.level+" "+item.rarity+" "+itemstats.name+(gear.upgrades ? " "+gear.upgrades.map(u => "["+details.items[u].name+"]").join(" ") : "")+"\n";
					};
					string += "**__"+phrases.get("BUILDS_ARMOR")+"__**\n\n";
					['Helm', 'Shoulders', 'Coat', 'Gloves', 'Leggings', 'Boots'].forEach(format);
					string += "\n**__"+phrases.get("BUILDS_TRINKETS")+"__**\n\n";
					['Backpack', 'Accessory1', 'Accessory2', 'Amulet', 'Ring1', 'Ring2'].forEach(format);
					string += "\n**__"+phrases.get("BUILDS_WEAPONS")+"__**\n\n";
					['WeaponA1', 'WeaponA2'].forEach(format);
					string += "\n";
					['WeaponB1', 'WeaponB2'].forEach(format);
					next(null, string);
				});
			}
		}
	], function(err, result) {
		message.channel.stopTyping(function() {
			if (err) {
				var scope = err.message.match(/^requires scope (.+)?/);
				if (scope) message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: scope[1] }));
				else if (err.message === "endpoint requires authentication") message.reply(phrases.get("CORE_NO_KEY"));
				else if (err.message === "no such character") message.reply(phrases.get("BUILDS_NO_CHARACTER", { name: character }));
				else {
					message.reply(phrases.get("CORE_ERROR"));
					console.log(err.message);
				}
				return;
			}
			message.reply(result);
		});
	});
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
}
