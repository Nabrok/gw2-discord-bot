var
	async = require('async'),
	config = require('config'),
	db = require('../lib/db'),
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

function messageReceived(message) {
	if (message.content.match(new RegExp('^!'+phrases.get("CORE_HELP")+'$', 'i'))) {
		message.author.sendMessage(phrases.get("WVWSCORE_HELP"));
		return;
	}
	var score_cmd = phrases.get("WVWSCORE_SCORE");
	var relscore_cmd = phrases.get("WVWSCORE_RELSCORE");
	var kd_cmd = phrases.get("WVWSCORE_KD");
	if (! message.content.match(new RegExp('^!('+score_cmd+'|'+relscore_cmd+'|'+kd_cmd+')$', 'i'))) return;
	async.waterfall([
		function(next) { message.channel.startTyping(next); },
		function(something, next) { db.getAccountByUser(message.author.id, next); },
		function(account, next) {
			if (account && account.world) return next(null, account.world);
			next(null, guild_world);
		},
		function(world, next) {
			gw2.request('/v2/wvw/matches?world='+world, null, next, { ttl: 5000 });
		},
		function(match, next) {
			var world_ids = Object.keys(match.worlds).map(c => match.worlds[c]);
			gw2.getWorlds(world_ids, function(err, worlds) {
				if (err) return next(err);
				var scores = Object.keys(match.worlds).map(color => ({
					color: color,
					name: worlds[match.worlds[color]].name,
					score: match.scores[color],
					ppt: countPPT(match, color),
					kills: match.kills[color],
					deaths: match.deaths[color]
				}));
				next(null, scores);
			});
		}
	], function(err, scores) {
		var result;
		if (message.content.match(new RegExp('^!'+score_cmd+'$', 'i')))
			result = scores.sort((a, b) => (b.score - a.score)).map(world => (world.name+': '+world.score.toLocaleString()+' (+'+world.ppt+')')).join("\n");
		else if (message.content.match(new RegExp('^!'+kd_cmd+'$', 'i')))
			result = scores.sort((a, b) => ((b.kills / b.deaths) - (a.kills / a.deaths))).map(world => (world.name+': '+world.kills.toLocaleString()+'/'+world.deaths.toLocaleString()+' = '+(world.kills / world.deaths).toLocaleString())).join("\n");
		else if (message.content.match(new RegExp('^!'+relscore_cmd+'$', 'i'))) {
			var sorted = scores.sort((a, b) => (b.score - a.score));
			result = sorted.map((world, index) => (world.name+': '+((index === 0) ? world.score : world.score - sorted[index - 1].score).toLocaleString() +' (+'+world.ppt+')')).join("\n");
		}
		message.channel.stopTyping(function() {
			message.reply("```"+result+"```");
		});
	});
}

module.exports = function(bot) {
	if (! guild_world) {
		console.log('wvw_score requires guild world to be set.');
		return;
	}
	bot.on("message", messageReceived);
};
