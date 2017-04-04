var
	Promise = require('bluebird'),
	config = require('config'),
	db = Promise.promisifyAll(require('../lib/db')),
	gw2 = require('../lib/gw2'),
	phrases = require('../lib/phrases')
;

var guild_world = config.has('world.id') ? config.get('world.id') : null;
var bot_id;
var embed_messages = [];

const refresh_emoji = phrases.get("WVWSCORE_EMBED_REFRESH_EMOJI");
const overall_emoji = phrases.get("WVWSCORE_EMBED_OVERALL_EMOJI");
const eb_emoji = phrases.get("WVWSCORE_EMBED_EB_EMOJI");
const green_emoji = phrases.get("WVWSCORE_EMBED_GREEN_EMOJI");
const blue_emoji = phrases.get("WVWSCORE_EMBED_BLUE_EMOJI");
const red_emoji = phrases.get("WVWSCORE_EMBED_RED_EMOJI");

const line = '──────────────';
const region_names = ['', phrases.get("WVWSCORE_REGION_NA"), phrases.get("WVWSCORE_REGION_EU")];
const embed_colors = { green: 0x00ff00, blue: 0x0000ff, red: 0xff0000 };
const color_name = { green: phrases.get("WVWSCORE_GREEN_COLOR"), blue: phrases.get("WVWSCORE_BLUE_COLOR"), red: phrases.get("WVWSCORE_RED_COLOR") };

function countMapPPT(map, color) {
	return map.objectives.reduce((map_ppt, objective) => {
		if (objective.owner.toLowerCase() !== color) return map_ppt;
		var value = objective.points_tick || 0;
		return map_ppt + value;
	}, 0);
}

function countPPT(match, color) {
	return match.maps.reduce((total_ppt, map) => total_ppt + countMapPPT(map, color), 0);
}

function formatWorldNames(worlds, color) {
	switch (color) {
		case "green":
			color = phrases.get("WVWSCORE_GREEN_COLOR");
			break;
		case "red":
			color = phrases.get("WVWSCORE_RED_COLOR");
			break;
		case "blue":
			color = phrases.get("WVWSCORE_BLUE_COLOR");
			break;
		default:
			color = '';
			break;
	}
	if (color) {
		return worlds.join(' + ')+' ('+color+')';
	} else {
		return worlds.join(' + ');
	}
}

function getScores(match, map) {
	var world_ids = [].concat.apply([], Object.keys(match.all_worlds).map(c => match.all_worlds[c]));
	var score_obj = (map === 'all') ? match : match.maps.find(m => m.type === map);
	var skirmish = match.skirmishes[match.skirmishes.length - 1];
	var skirmish_scores = (map === 'all') ? skirmish.scores : skirmish.map_scores.find(m => m.type === map).scores;
	return gw2.getWorlds(world_ids).then(worlds => {
		var names = {};
		var colors = Object.keys(match.all_worlds);
		for (var c in colors) {
			var color = colors[c];
			names[color] = [ match.worlds[color] ].concat(match.all_worlds[color].filter(w => (w !== match.worlds[color]))).map(w => worlds[w].name);
		}
		var scores = Object.keys(match.worlds).map(color => ({
			color: color,
			names: names[color],
			skirmish: skirmish_scores[color],
			score: score_obj.scores[color],
			victory_points: match.victory_points[color],
			ppt: (map === 'all') ? countPPT(match, color) : countMapPPT(score_obj, color),
			kills: score_obj.kills[color],
			deaths: score_obj.deaths[color]
		}));
		return scores;
	});
}

function formatEmbed(match, scores, map) {
	var region = region_names[match.id.split('-')[0]];
	var tier = match.id.split('-')[1];
	var most_worlds = scores.reduce((max, w) => (w.names.length > max) ? w.names.length : max, 0);
	var sorted = scores.sort((a,b) => {
		var vp_diff = (map === 'all') ? b.victory_points - a.victory_points : 0;
		return (vp_diff || b.skirmish - a.skirmish || b.score - a.score);
	});
	var map_name = phrases.get("WVWSCORE_OVERALL");
	if (map === 'Center') map_name = phrases.get("WVWSCORE_MAP_CENTER");
	if (map === 'GreenHome') map_name = phrases.get("WVWSCORE_MAP_GREEN");
	if (map === 'BlueHome') map_name = phrases.get("WVWSCORE_MAP_BLUE");
	if (map === 'RedHome') map_name = phrases.get("WVWSCORE_MAP_RED");
	var fields = sorted.map(world => {
		var names = world.names.join("\n");
		for (var i = world.names.length; i < most_worlds; i++) {
			names += "\n";
		}
		var stats = [];
		stats.push(phrases.get("WVWSCORE_EMBED_VP", { points: world.victory_points.toLocaleString() }));
		stats.push(phrases.get("WVWSCORE_EMBED_SKIRMISH", { points: world.skirmish.toLocaleString() }));
		stats.push(phrases.get("WVWSCORE_EMBED_TOTAL", { points: world.score.toLocaleString() }));
		stats.push(phrases.get("WVWSCORE_EMBED_PPT", { ppt: world.ppt.toLocaleString() }));
		stats.push(phrases.get("WVWSCORE_EMBED_KD", { kd: (world.kills / world.deaths).toLocaleString()}));
		return {
			name: color_name[world.color],
			value: names+"\n"+line+"\n"+stats.join("\n"),
			inline: true
		};
	});
	return {
		type: 'rich',
		title: phrases.get("WVWSCORE_EMBED_TITLE"),
		description: phrases.get("WVWSCORE_EMBED_DESCRIPTION", { region, tier })+`\n${map_name}`,
		timestamp: new Date(),
		color: embed_colors[sorted[0].color],
		fields: fields,
		footer: { text: phrases.get("WVWSCORE_EMBED_FOOTER") }
	};
}

function messageReceived(message) {
	var match_cmd = phrases.get("WVWSCORE_MATCH");
	var score_cmd = phrases.get("WVWSCORE_SCORE");
	var relscore_cmd = phrases.get("WVWSCORE_RELSCORE");
	var kd_cmd = phrases.get("WVWSCORE_KD");
	if (! message.content.match(new RegExp('^!('+match_cmd+'|'+score_cmd+'|'+relscore_cmd+'|'+kd_cmd+')$', 'i'))) return;
	message.channel.startTyping();
	db.getAccountByUserAsync(message.author.id)
		.then(account => (account && account.world) ? account.world : guild_world)
		.then(world => gw2.request('/v2/wvw/matches?world='+world, null, null, { ttl: 5000 }))
		.then(match => {
			return getScores(match, 'all').then(scores => {
				if (message.content.match(new RegExp('^!'+match_cmd+'$', 'i'))) {
					return message.reply('', { embed: formatEmbed(match, scores, 'all') })
					.then(message => {
						embed_messages.push({ message_id: message.id, match: match.id, map: 'all' });
						return [refresh_emoji, overall_emoji, eb_emoji, green_emoji, blue_emoji, red_emoji]
							.map(e => () => message.react(e))
							.reduce((p,f) => p.then(f), Promise.resolve())
						;
					});
				}
				if (message.content.match(new RegExp('^!'+score_cmd+'$', 'i')))
					result = scores.sort((a, b) => (b.victory_points - a.victory_points || b.skirmish - a.skirmish)).map(world => (formatWorldNames(world.names, world.color)+': '+world.victory_points.toLocaleString()+' | '+world.skirmish.toLocaleString() + ' | +'+world.ppt)).join("\n");
				else if (message.content.match(new RegExp('^!'+kd_cmd+'$', 'i')))
					result = scores.sort((a, b) => ((b.kills / b.deaths) - (a.kills / a.deaths))).map(world => (formatWorldNames(world.names, world.color)+': '+world.kills.toLocaleString()+'/'+world.deaths.toLocaleString()+' = '+(world.kills / world.deaths).toLocaleString())).join("\n");
				else if (message.content.match(new RegExp('^!'+relscore_cmd+'$', 'i'))) {
					var sorted = scores.sort((a, b) => (b.score - a.score));
					result = sorted.map((world, index) => (formatWorldNames(world.names, world.color)+': '+((index === 0) ? world.score : world.score - sorted[index - 1].score).toLocaleString() +' (+'+world.ppt+')')).join("\n");
				}
				return message.reply("```"+result+"```");
			});
		})
		.catch(e => {
			console.error('Error retrieving wvw score: '+e.message);
			return message.reply(phrases.get("WVWSCORE_ERROR"));
		})
		.finally(() => message.channel.stopTyping())
	;
}

function reactionChange(reaction, user) {
	if (user.id === bot_id) return;
	var embed = embed_messages.find(emb => emb.message_id === reaction.message.id);
	if (! embed) return;
	var map;
	if (reaction.emoji.name === refresh_emoji) map = embed.map;
	if (reaction.emoji.name === overall_emoji) map = 'all';
	if (reaction.emoji.name === eb_emoji) map = 'Center';
	if (reaction.emoji.name === green_emoji) map = 'GreenHome';
	if (reaction.emoji.name === blue_emoji) map = 'BlueHome';
	if (reaction.emoji.name === red_emoji) map = 'RedHome';
	if (! map) return;
	embed.map = map;
	gw2.request('/v2/wvw/matches?id='+embed.match)
	.then(match => getScores(match, map).then(scores => reaction.message.edit('', { embed: formatEmbed(match, scores, map) })))
	.catch(e => {
		console.error("Error updating wvw score embed: "+e.message);
		return reaction.message.edit(phrases.get("WVWSCORE_EMBED_UPDATE_ERROR"));
	})
	.then(() => reaction.remove(user))
	.catch(e => {
		return reaction.message.edit(phrases.get("WVWSCORE_EMBED_REACTION_ERROR"));
	})
	.catch(e => console.error('WvW score error: '+e.message));
}

module.exports = function(bot) {
	if (! guild_world) {
		console.log('wvw_score requires guild world to be set.');
		return;
	}
	bot.on("ready", () => {
		bot_id = bot.user.id;
	});
	bot.on("message", messageReceived);
	bot.on("messageReactionAdd", reactionChange);
};
