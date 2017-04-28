var
	Promise = require('bluebird'),
	db = Promise.promisifyAll(require('../lib/db')),
	phrases = require('../lib/phrases'),
	gw2 = require('../lib/gw2')
;

function startTyping(channel) {
	return new Promise((resolve, reject) => {
		channel.startTyping(err => {
			if (err) return reject(err);
			resolve();
		});
	});
}

function getBuildString(character, type) {
	var specs = character.specializations[type].filter(s => !!s);
	var skills = character.skills[type];
	// Get the specialization and trait ids while filtering out null values
	var spec_ids = specs.map(s => s.id);
	var trait_ids = specs.reduce((all_traits, s) => all_traits.concat(s.traits.filter(t => !!t)), []);
	var skill_promise;
	if (skills.legends) {
		skill_promise = gw2.getLegends(skills.legends)
			.then(legends => gw2.getSkills(Object.keys(legends).map(l => legends[l].swap)))
		;
	} else {
		var skill_ids = [ skills.heal, skills.elite ].concat(skills.utilities).filter(s => !!s);
		skill_promise = gw2.getSkills(skill_ids);
	}
	return Promise.all([
		skill_promise,
		gw2.getSpecializations(spec_ids),
		gw2.getTraits(trait_ids)
	]).then(details => {
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
	});
}

function getEquipString(character) {
	var gear_ids = character.equipment.map(e => e.id);
	var upgrade_ids = character.equipment.filter(e => e.upgrades).reduce((t, u) => t.concat(u.upgrades), []);
	return gw2.getItems(gear_ids.concat(upgrade_ids))
		.then(items => {
			var infix_ids = Object.keys(items).filter(i => (items[i].details && items[i].details.infix_upgrade)).map(i => items[i].details.infix_upgrade.id);
			infix_ids = infix_ids.concat(character.equipment.filter(e => e.stats).map(e => e.stats.id));
			return gw2.getItemStats(infix_ids)
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
						string += (item.details.type || item.type)+": "+item.level+" "+item.rarity+" "+istat.name+(gear.upgrades ? " "+gear.upgrades.map(u => "["+items[u].name+"]").join(" ") : "")+"\n";
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
}

function messageReceived(message) {
	var traits_cmd = new RegExp('^!('+phrases.get("BUILDS_BUILD")+') (.+?)(?:\\s+(pve|wvw|pvp))?$', 'i');
	var equip_cmd = new RegExp('^!('+phrases.get("BUILDS_EQUIP")+') (.+)$', 'i');
	var privacy_cmd = new RegExp('!('+phrases.get("BUILDS_PRIVACY")+') (.+) (private|guild|public)$', 'i');
	var matches = message.content.match(traits_cmd) || message.content.match(equip_cmd) || message.content.match(privacy_cmd);
	if (! matches) return;
	var cmd = matches[1];
	var character = matches[2].replace(/<@\d+>/, "").trim();
	if (cmd === phrases.get("BUILDS_PRIVACY")) {
		var privacy = matches[3].toLowerCase();
		message.channel.startTyping();
		Promise.all([
			db.getUserKeyAsync(message.author.id)
				.then(key => gw2.request('/v2/characters', key))
				.then(characters => {
					var name = characters.find(c => c.toLowerCase() === character.toLowerCase());
					if (! name) throw new Error("no such character");
					return name;
				}),
			db.getObjectAsync('privacy:'+message.author.id)
		]).then(r => {
			var name = r[0], p = r[1];
			if (! p) p = {};
			if (privacy === "private") p[name] = 1;
			if (privacy === "guild")   p[name] = 2;
			if (privacy === "public")  p[name] = 4;
			return db.setObjectAsync('privacy:'+message.author.id, p);
		}).then(() => message.reply(phrases.get("BUILDS_PRIVACY_SET")))
		.catch(err => {
			if (err.message === "no such character") message.reply(phrases.get("BUILDS_NO_CHARACTER", { name: character }));
			else {
				message.reply(phrases.get("CORE_ERROR"));
				console.error(err.stack);
			}
		})
		.then(() => message.channel.stopTyping());
		return;
	}
	var discord_id = message.author.id;
	if (message.mentions && message.mentions.users.length === 1) discord_id = message.mentions.users.first().id;
	var type = matches[3] || "pve"; // Default to PvE
	type = type.toLowerCase();
	var permissions_needed = ['characters'];
	if (cmd === phrases.get("BUILDS_BUILD")) permissions_needed.push("builds");
	if (cmd === phrases.get("BUILDS_EQUIP")) permissions_needed.push("inventories");
	message.channel.startTyping();
	var preamble = db.getUserKeyAsync(discord_id)
		.then(key => {
			if (! key) throw new Error("endpoint requires authentication");
			return db.checkKeyPermissionAsync(discord_id, permissions_needed)
				.then(hasPerm => {
					if (! hasPerm) throw new Error("requires scope "+permissions_needed.join(" and "));
					return gw2.request('/v2/characters', key);
				})
				.then(characters => {
					// We want it to be case insensitive, so find the correct case for the name given
					var name = characters.find(c => c.toLowerCase() === character.toLowerCase());
					if (! name) throw new Error("no such character");
					// If we're asking about ourselves, continue
					if (message.author.id === discord_id) return { name, key };
					// Check permissions if asking about somebody else
					return db.getObjectAsync('privacy:'+discord_id)
						.then(privacy => {
							if (! privacy || ! privacy[name]) throw new Error("private");
							if (privacy[name] === 1) throw new Error("private");
							if (privacy[name] === 4) return { name, key }; // Public
							// Guild members only
							return db.getUserKeyAsync(message.author.id)
								.then(author_key => Promise.all([
									gw2.request('/v2/account', key),
									gw2.request('/v2/account', author_key)
								]))
								.then(accounts => {
									var match = accounts[0].guilds.some(g => accounts[1].guilds.indexOf(g) > -1);
									if (! match) throw new Error("private");
									return { name, key };
								})
							;
						})
					;
				})
			;
		})
		.then(d => gw2.request('/v2/characters/'+encodeURIComponent(d.name), d.key))
		.then(character => {
			if (cmd === phrases.get("BUILDS_BUILD")) return getBuildString(character, type);
			else if (cmd === phrases.get("BUILDS_EQUIP")) return getEquipString(character);
		})
		.then(string => message.reply(string))
		.catch(err => {
			var scope = err.message.match(/^requires scope (.+)?/);
			if (scope) message.reply(phrases.get("CORE_MISSING_SCOPE", { scope: scope[1] }));
			else if (err.message === "endpoint requires authentication") message.reply(phrases.get("CORE_NO_KEY"));
			else if (err.message === "no such character") message.reply(phrases.get("BUILDS_NO_CHARACTER", { name: character }));
			else if (err.message === "more than one mention") message.reply(phrases.get("BUILDS_TOO_MANY_MENTIONS"));
			else if (err.message === "private") message.reply(phrases.get("BUILDS_PRIVATE"));
			else {
				message.reply(phrases.get("CORE_ERROR"));
				console.error(err.stack);
			}
			return;
		})
		.finally(() => message.channel.stopTyping())
	;
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
}

module.exports.getBuildString = getBuildString;
module.exports.getEquipString = getEquipString;
