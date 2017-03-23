var
	Promise = require('bluebird'),
	config = require('config'),
	db = Promise.promisifyAll(require('../lib/db')),
	gw2 = require('../lib/gw2'),
	phrases = require('../lib/phrases')
;

var guild_world = config.has('world.id') ? config.get('world.id') : null;

const objective_values = { Camp: 2, Tower: 4, Keep: 8, Castle: 12 };

function countPPT(match, color) {
	return match.maps.reduce((total_ppt, map) => {
		return total_ppt + map.objectives.reduce((map_ppt, objective) => {
			if (objective.owner.toLowerCase() !== color) return map_ppt;
			var value = objective_values[objective.type] || 0;
			return map_ppt + value;
		}, 0);
	}, 0);
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

function messageReceived(message) {
	var score_cmd = phrases.get("WVWSCORE_SCORE");
	var relscore_cmd = phrases.get("WVWSCORE_RELSCORE");
	var kd_cmd = phrases.get("WVWSCORE_KD");
	if (! message.content.match(new RegExp('^!('+score_cmd+'|'+relscore_cmd+'|'+kd_cmd+')$', 'i'))) return;
	message.channel.startTyping();
	db.getAccountByUserAsync(message.author.id)
		.then(account => (account && account.world) ? account.world : guild_world)
		.then(world => gw2.request('/v2/wvw/matches?world='+world, null, null, { ttl: 5000 }))
		.then(match => {
			var world_ids = [].concat.apply([], Object.keys(match.all_worlds).map(c => match.all_worlds[c]));
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
					score: match.scores[color],
					victory_points: match.victory_points[color],
					ppt: countPPT(match, color),
					kills: match.kills[color],
					deaths: match.deaths[color]
				}));
				if (message.content.match(new RegExp('^!'+score_cmd+'$', 'i')))
					result = scores.sort((a, b) => (b.victory_points - a.victory_points)).map(world => (formatWorldNames(world.names, world.color)+': '+world.victory_points.toLocaleString()+' (+'+world.ppt+')')).join("\n");
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
			console.error(e.stack);
			return phrases.get("WVWSCORE_ERROR");
		})
		.then(() => message.channel.stopTyping())
	;
}

module.exports = function(bot) {
	if (! guild_world) {
		console.log('wvw_score requires guild world to be set.');
		return;
	}
	bot.on("message", messageReceived);
};
