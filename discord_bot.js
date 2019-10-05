#! /usr/bin/env nodejs
var
	config = require('config'),
	Discord = require('discord.js'),
	gw2 = require('./lib/gw2'),
	phrases = require('./lib/phrases'),
	db = require('./lib/database')
;
const graphql = require('./lib/graphql');
const version = require('./package').version;

var language = config.has('features.language') ? config.get('features.language') : "en";
var features = config.has('features.enabled') ? config.get('features.enabled').slice() : [];

gw2.setLanguage(language);

console.log('Use this link to add the bot to a discord server: https://discordapp.com/oauth2/authorize?client_id='+config.get('discord.clientid')+'&scope=bot&permissions=8');
var bot = new Discord.Client({ autoReconnect: true });
bot.setMaxListeners(Infinity);

if (features.indexOf("link") === -1) features.unshift("link");
const schemas = [];
features.forEach(feature => {
	const schema = require('./features/'+feature)(bot);
	if (schema) schemas.push(schema);
});

bot.on("ready", function() {
	console.log('bot ready');
	graphql(schemas, bot);
});

bot.on("disconnected", function() {
	console.log('disconnected');
});

bot.on("message", function(message) {
	if (message.content.match(new RegExp('^!'+phrases.get("CORE_HELP")+'$', 'i'))) {
		var help = features.map(f => phrases.get(f.toUpperCase()+"_HELP")).filter(f => !!f).join("\n\n").trim();
		message.author.send("```Commands```\n"+help+`\n\nVersion: ${version}`);
		return;
	}
});

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGEGV', 'SIGUSR2', 'SIGTERM'].forEach(sig => {
	process.on(sig, async () => {
		console.log(`Exiting on ${sig}`);
		await bot.destroy();
		process.exit(1);
	});
});

var token = config.get('discord.token');
if (! token.match(/^Bot /)) token = 'Bot '+token;

db.knex.migrate.latest().then(() => bot.login(token));
