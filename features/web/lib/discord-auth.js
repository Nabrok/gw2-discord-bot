var
	config = require('config'),
	ClientOAuth2 = require('client-oauth2'),
	request = require('request')
;

var client_id = config.get('discord.clientid');
var client_secret = config.get('discord.client_secret');
var protocol = config.has('web.protocol') ? config.get('web.protocol') : 'http';
var http_port = config.get('web.port');
var domain = config.get('web.domain');
var public_url = config.has('web.public_url') ? config.get('web.public_url') : protocol+"://"+domain+(((protocol === "http" && http_port !== "80") || (protocol === "https" && http_port !== "443")) ? ":"+http_port : "");

var auth = {};

auth.client = new ClientOAuth2({
	clientId: client_id,
	clientSecret: client_secret,
	accessTokenUri: 'https://discordapp.com/api/oauth2/token',
	authorizationUri: 'https://discordapp.com/api/oauth2/authorize',
	redirectUri: public_url + '/auth',
	scopes: ['identify']
});

auth.getUri = auth.client.code.getUri;
auth.processLogin = (code, callback) => {
	auth.client.code.getToken(code).then(user => {
		var options = {
			url: 'https://discordapp.com/api/users/@me',
			json: true,
			timeout: 10000,
			headers: {
				Authorization: 'Bearer '+user.accessToken
			}
		};
		request(options, function(error, http_res, result) {
			if (error) return callback(error);
			callback(null, result);
		});
	}).catch(err => {
		console.log(err);
		callback(err);
	});
}

module.exports = auth;
