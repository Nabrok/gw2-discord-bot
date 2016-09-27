var
	config = require('config'),
	ClientOAuth2 = require('client-oauth2'),
	request = require('request'),
	nJwt = require('njwt')
;

var client_id = config.get('discord.clientid');
var client_secret = config.get('discord.client_secret');
var protocol = config.has('web.protocol') ? config.get('web.protocol') : 'http';
var http_port = config.get('web.port');
var domain = config.get('web.domain');
var jwt_secret = config.has('web.jwt_secret') ? config.get('web.jwt_secret') : client_secret;

var auth = {};

auth.client = new ClientOAuth2({
	clientId: client_id,
	clientSecret: client_secret,
	accessTokenUri: 'https://discordapp.com/api/oauth2/token',
	authorizationUri: 'https://discordapp.com/api/oauth2/authorize',
	redirectUri: protocol + '://' + domain + ':' + http_port + '/auth',
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
			if (error) console.log(error);
			var jwt = nJwt.create({ sub: JSON.stringify(result) }, jwt_secret);
			callback({ message: 'success', jwt: jwt.compact() });
		});
	}).catch(err => {
		console.log(err);
	});
}

module.exports = auth;


module.exports = auth;
