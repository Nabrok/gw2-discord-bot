#! /usr/bin/env nodejs
var
	config = require('config'),
	Discord = require('discord.js'),
	gw2 = require('./lib/gw2'),
	phrases = require('./lib/phrases')
;

var language = config.has('features.language') ? config.get('features.language') : "en";
var features = config.has('features.enabled') ? config.get('features.enabled').slice() : [];

gw2.setLanguage(language);

console.log('Use this link to add the bot to a discord server: https://discordapp.com/oauth2/authorize?client_id='+config.get('discord.clientid')+'&scope=bot&permissions=8');
var bot = new Discord.Client({ autoReconnect: true });
bot.setMaxListeners(Infinity);

if (features.indexOf("link") === -1) features.unshift("link");
features.forEach(feature => {
	require('./features/'+feature)(bot);
});

bot.on("ready", function() {
	console.log('bot ready');
});

bot.on("disconnected", function() {
	console.log('disconnected');
});

bot.on("message", function(message) {
	if (message.content.match(new RegExp('^!'+phrases.get("CORE_HELP")+'$', 'i'))) {
		var help = features.map(f => phrases.get(f.toUpperCase()+"_HELP")).filter(f => !!f).join("\n\n").trim();
		message.author.sendMessage("```Commands```\n"+help);
		return;
	}
});

var token = config.get('discord.token');
if (! token.match(/^Bot /)) token = 'Bot '+token;

bot.login(token);
