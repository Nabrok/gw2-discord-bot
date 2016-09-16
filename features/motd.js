var
	async = require('async'),
	config = require('config'),
	gw2 = require('../lib/gw2_api')
;

var guild_id = config.get('guild.id');
var guild_key = config.get('guild.key');
var channel_name = config.get('guild.motd_channel');

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
	if (! guild_id) return;
	if (! channel_name) return;

	// Update motd every time the guild log is requested
	gw2.addHook('/v2/guild/'+guild_id+'/log', function(log, key, next_hook) {
		var motd = log.filter(l => (l.type === 'motd'))[0];
		var time = new Date(motd.time);
		var text = motd.motd + "\n\n- "+motd.user+"\n"+time.toDateString();
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
