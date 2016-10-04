var
	Promise = require('bluebird'),
	db = Promise.promisifyAll(require('../lib/db')),
	phrases = require('../lib/phrases'),
	gw2 = Promise.promisifyAll(require('../lib/gw2'))
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
	var permissions_needed = ['characters'];
	if (cmd === phrases.get("BUILDS_BUILD")) permissions_needed.push("builds");
	if (cmd === phrases.get("BUILDS_EQUIP")) permissions_needed.push("inventories");
	var preamble = new Promise((resolve, reject) => {
			message.channel.startTyping(err => {
				if (err) return reject(err);
				resolve();
			});
		})
		.then(() => db.checkKeyPermissionAsync(message.author.id, permissions_needed))
		.then(hasPerm => { if (! hasPerm) throw new Error("requires scope "+permissions_needed.join(" and ")); })
		.then(() => db.getUserKeyAsync(message.author.id))
		.then(key => {
			if (! key) throw new Error("endpoint requires authentication");
			return gw2.requestAsync('/v2/characters', key)
				.then(characters => {
					// We want it to be case insensitive, so find the correct case for the name given
					var name = characters.filter(c => c.toLowerCase() === character.toLowerCase())[0];
					if (! name) throw new Error("no such character");
					// Then request the specializations for that characetr
					return gw2.requestAsync('/v2/characters/'+encodeURIComponent(name), key);
				})
			;
		})
	;
	var makeString;
	if (cmd === phrases.get("BUILDS_BUILD")) makeString = preamble
		.then(character => {
			var specs = character.specializations[type].filter(s => !!s);
			var skills = character.skills[type];
			// Get the specialization and trait ids while filtering out null values
			var spec_ids = specs.map(s => s.id);
			var trait_ids = specs.reduce((all_traits, s) => all_traits.concat(s.traits.filter(t => !!t)), []);
			var skill_promise;
			if (skills.legends) {
				skill_promise = gw2.getLegendsAsync(skills.legends)
					.then(legends => gw2.getSkillsAsync(Object.keys(legends).map(l => legends[l].swap)))
				;
			} else {
				var skill_ids = [ skills.heal, skills.elite ].concat(skills.utilities).filter(s => !!s);
				skill_promise = gw2.getSkillsAsync(skill_ids);
			}
			return Promise.all([
				skill_promise,
				gw2.getSpecializationsAsync(spec_ids),
				gw2.getTraitsAsync(trait_ids)
			])
			.then(details => {
				var skill_detail = details[0], spec_detail = details[1], trait_detail = details[2];
				// Form the output string
				var traits_text = phrases.get("BUILDS_TRAITS");
				var string = "```"+character.name+": "+character.level+" "+character.profession+"```\n";
				string += "**__"+traits_text+"__**\n\n";
				string += specs.map(s =>
					spec_detail[s.id].name + ': ' + s.traits.filter(t => !!t).map(t => trait_detail[t].name).join(", ")
				).join("\n");
				if (skills.legends) {
					var legends_text = phrases.get("BUILDS_LEGENDS");
					string += "\n\n**__"+legends_text+"__**\n\n";
					string += Object.keys(skill_detail).map(s => skill_detail[s].name).join(", ")+"\n";
				} else {
					var skills_text = phrases.get("BUILDS_SKILLS");
					string += "\n\n**__"+skills_text+"__**\n\n";
					var utils = skills.utilities.filter(s => !!s);
					if (skills.heal) string += phrases.get("BUILDS_HEAL")+": "+skill_detail[skills.heal].name+"\n";
					if (utils.length > 0) string += phrases.get("BUILDS_UTILITIES")+": "+utils.map(s => skill_detail[s].name).join(", ")+"\n";
					if (skills.elite) string += phrases.get("BUILDS_ELITE")+": "+skill_detail[skills.elite].name+"\n";
				}
				return string;
			})
		})
	;
	else if (cmd === phrases.get("BUILDS_EQUIP")) makeString = preamble
		.then(character => {
			var gear_ids = character.equipment.map(e => e.id);
			var upgrade_ids = character.equipment.filter(e => e.upgrades).reduce((t, u) => t.concat(u.upgrades), []);
			return gw2.getItemsAsync(gear_ids.concat(upgrade_ids))
				.then(items => {
					var infix_ids = Object.keys(items).filter(i => (items[i].details && items[i].details.infix_upgrade)).map(i => items[i].details.infix_upgrade.id);
					infix_ids = infix_ids.concat(character.equipment.filter(e => e.stats).map(e => e.stats.id));
					return gw2.getItemStatsAsync(infix_ids)
						.then(itemstats => {
							var gear_hash = character.equipment.reduce((t, e) => {
								t[e.slot] = e;
								return t;
							}, {});
							var string = "```"+character.name+": "+character.level+" "+character.profession+"```\n";
							var format = function(slot) {
								if (! gear_hash[slot]) return;
								var gear = gear_hash[slot];
								var item = items[gear.id];
								var istat = gear.stats ? itemstats[gear.stats.id] : item.details.infix_upgrade ? itemstats[item.details.infix_upgrade.id] : { name: '*not selected*' };
								if (! istat) istat = { name: '*unknown*' };
								string += (item.details.type || item.type)+": "+item.level+" "+item.rarity+" "+itemstats.name+(gear.upgrades ? " "+gear.upgrades.map(u => "["+items[u].name+"]").join(" ") : "")+"\n";
							};
							string += "**__"+phrases.get("BUILDS_ARMOR")+"__**\n\n";
							['Helm', 'Shoulders', 'Coat', 'Gloves', 'Leggings', 'Boots'].forEach(format);
							string += "\n**__"+phrases.get("BUILDS_TRINKETS")+"__**\n\n";
							['Backpack', 'Accessory1', 'Accessory2', 'Amulet', 'Ring1', 'Ring2'].forEach(format);
							string += "\n**__"+phrases.get("BUILDS_WEAPONS")+"__**\n\n";
							['WeaponA1', 'WeaponA2'].forEach(format);
							string += "\n";
							['WeaponB1', 'WeaponB2'].forEach(format);
							return string;
						})
					;
				})
			;
		})
	;
	makeString
		.then(string => message.reply(string))
		.catch(err => {
			var scope = err.message.match(/^requires scope (.+)?/);
			if (scope) message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: scope[1] }));
			else if (err.message === "endpoint requires authentication") message.reply(phrases.get("CORE_NO_KEY"));
			else if (err.message === "no such character") message.reply(phrases.get("BUILDS_NO_CHARACTER", { name: character }));
			else {
				message.reply(phrases.get("CORE_ERROR"));
				console.log(err.message);
			}
			return;
		})
		.then(() => message.channel.stopTyping())
	;
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
}
