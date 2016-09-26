var
	express = require('express'),
	config = require('config'),
	request = require('request'),
	ClientOAuth2 = require('client-oauth2')
;

var client_id = config.get('discord.clientid');
var client_secret = config.get('discord.client_secret');
var protocol = config.has('web.protocol') ? config.get('web.protocol') : 'http';
var http_port = config.get('web.port');
var domain = config.get('web.domain');

var discordAuth = new ClientOAuth2({
	clientId: client_id,
	clientSecret: client_secret,
	accessTokenUri: 'https://discordapp.com/api/oauth2/token',
	authorizationUri: 'https://discordapp.com/api/oauth2/authorize',
	redirectUri: protocol + '://' + domain + ':' + http_port + '/auth',
	scopes: ['identify']
});

var app = express();

app.get('/login', (req, res) => {
	var uri = discordAuth.code.getUri();
	res.redirect(uri);
});

app.get('/', function(req, res) {
	res.send('<html><body><a href="/login">login</a></body></html>');
});

app.get('/auth', function(req, res) {
	discordAuth.code.getToken(req.originalUrl).then(user => {
		var options = {
			url: 'https://discordapp.com/api/users/@me',
			json: true,
			timeout: 10000,
			headers: {
				Authorization: 'Bearer '+user.accessToken
			}
		};
		request(options, function(error, http_res, result) {
			if (error) console.log(error);
			res.send('Hello '+result.username+'!');
		});
	});
});

app.listen(http_port, function() {
	console.log('http listenting on port '+http_port+'!');
});

module.exports = function(bot) {
};
