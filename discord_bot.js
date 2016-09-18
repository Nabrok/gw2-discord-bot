#! /usr/bin/env nodejs
var
	config = require('config'),
	Discord = require('discord.js'),
	gw2 = require('./lib/gw2_api')
;

var language = config.has('features.language') ? config.get('features.language') : "en";
var features = config.has('features.enabled') ? config.get('features.enabled').slice() : [];

gw2.setLanguage(language);

console.log('Use this link to add the bot to a discord server: https://discordapp.com/oauth2/authorize?client_id='+config.get('discord.clientid')+'&scope=bot&permissions=8');
var bot = new Discord.Client({ autoReconnect: true });

if (features.indexOf("link") === -1) require('./features/link')(bot);
features.forEach(feature => {
	require('./features/'+feature)(bot);
});

bot.on("ready", function() {
	console.log('bot ready');
});

bot.on("disconnected", function() {
	console.log('disconnected');
});

var token = config.get('discord.token');
if (! token.match(/^Bot /)) token = 'Bot '+token;

bot.loginWithToken(token);
