var
	Autolinker = require('autolinker'),
	async = require('async'),
	config = require('config'),
	gw2 = require('../lib/gw2_api')
;

var guild_id = config.has('guild.id') ? config.get('guild.id') : null;
var guild_key = config.has('guild.key') ? config.get('guild.key') : null;
var channel_name = config.has('guild.motd_channel') ? config.get('guild.motd_channel') : null;
var convert_urls = config.has('guild.motd_convert_urls') ? config.get('guild.motd_convert_urls') : true;
var excluded_subdomains = config.has('guild.motd_excluded_subdomains') ? config.get('guild.motd_excluded_subdomains') : [];

function messageReceived(message) {
	if (! message.channel.isPrivate) return;
	if (message.content === "refresh motd") {
		message.channel.startTyping(function() {
			gw2.request('/v2/guild/'+guild_id+'/log', guild_key, function() {
				message.channel.stopTyping(function() {
					message.reply('Message of the day updated.');
				});
			});
		});
	}
}

module.exports = function(bot) {
	if (! (guild_id && guild_key && channel_name)) {
		console.log('motd requires Guild ID, Guild Key, and MOTD channel in config');
		return;
	}

	// Update motd every time the guild log is requested
	gw2.addHook('/v2/guild/'+guild_id+'/log', function(log, key, next_hook) {
		var motd = log.filter(l => (l.type === 'motd'))[0];
		var time = new Date(motd.time);
		var text = motd.motd + "\n\n- "+motd.user+"\n"+time.toDateString();

		// Trim text
		text = text.split('\n').map(function(t) { return t.trim(); }).join('\n').trim();

		// Convert all urls to a proper url if enabled
		if (convert_urls) {
			var regex = new RegExp('('+excluded_subdomains.join('|')+')\.[^\.]*\.');
			text = Autolinker.link(text, {
				replaceFn: function(match) {
					if (match.getType() === 'url') {
						if (excluded_subdomains.length === 0 || ! match.url.match(regex)) {
							return match.getUrl();
						}
					}
					return false;
				}
			});
		}

		var channels = bot.channels.getAll('name', channel_name);
		async.each(channels, function(channel, next_channel) {
			bot.setChannelTopic(channel, text, next_channel);
		}, next_hook);
	});

	bot.on("message", messageReceived);
	bot.on("ready", function() {
		gw2.keepUpdated('/v2/guild/'+guild_id+'/log', guild_key, 60 * 60 * 1000); // every hour
	});
};
