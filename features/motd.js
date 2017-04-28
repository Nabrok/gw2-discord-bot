var
	async = require('async'),
	Autolinker = require('autolinker'),
	config = require('config'),
	gw2 = require('../lib/gw2'),
	parseDomain = require('parse-domain'),
	phrases = require('../lib/phrases')
;

var guild_id = config.has('guild.id') ? config.get('guild.id') : null;
var guild_key = config.has('guild.key') ? config.get('guild.key') : null;
var channel_name = config.has('guild.motd_channel') ? config.get('guild.motd_channel') : null;
var convert_urls = config.has('guild.motd_convert_urls') ? config.get('guild.motd_convert_urls') : true;
var excluded_subdomains = config.has('guild.motd_excluded_subdomains') ? config.get('guild.motd_excluded_subdomains') : [];

function messageReceived(message) {
	if (message.channel.type !== 'dm') return;
	if (message.content.match(new RegExp("^!?"+phrases.get("MOTD_REFRESH")+'$', 'i'))) {
		message.channel.startTyping();
		gw2.request('/v2/guild/'+guild_id+'/log', guild_key)
			.then(() => message.reply(phrases.get("MOTD_UPDATED")))
			.catch(err => {
				console.error(err.message);
				return message.reply(phrases.get("CORE_ERROR"));
			})
			.then(() => message.channel.stopTyping())
		;
	}
}

module.exports = function(bot) {
	if (! (guild_id && guild_key && channel_name)) {
		console.log('motd requires Guild ID, Guild Key, and MOTD channel in config');
		return;
	}

	// Update motd every time the guild log is requested
	gw2.on('/v2/guild/'+guild_id+'/log', (log, key, from_cache) => {
		if (from_cache) return;
		var motd = log.filter(l => (l.type === 'motd'))[0];
		var time = new Date(motd.time);
		var text = motd.motd + "\n\n- "+motd.user+"\n"+time.toDateString();

		// Trim text
		text = text.split('\n').map(function(t) { return t.trim(); }).join('\n').trim();

		// Convert all urls to a proper url if enabled
		if (convert_urls) {
			var regex = new RegExp('('+excluded_subdomains.join('|')+')');
			text = Autolinker.link(text, {
				replaceFn: function(match) {
					if (match.getType() === 'url') {
						var sub = parseDomain(match.url).subdomain;
						if (excluded_subdomains.length === 0 || ! sub.match(regex)) {
							return match.getUrl();
						}
					}
					return false;
				}
			});
		}

		Promise.all(bot.guilds.map(server => {
			var channel = server.channels.find('name', channel_name);
			if (! channel) return console.log(`Can't update MOTD: No channel "${channel_name}" on guild "${server.name}"`);
			return channel.setTopic(text);
		})).catch(e => console.error(e.stack));
	});

	bot.on("message", messageReceived);
	bot.on("ready", function() {
		gw2.keepUpdated('/v2/guild/'+guild_id+'/log', guild_key, 60 * 60 * 1000); // every hour
	});
};
