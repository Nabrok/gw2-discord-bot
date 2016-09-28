var
	discordAuth = require('./discord-auth'),
	config = require('config'),
	nJwt = require('njwt'),
	db = require('../../../lib/db'),
	gw2 = require('../../../lib/gw2')
;

var jwt_secret = config.has('web.jwt_secret') ? config.get('web.jwt_secret') : config.get('discord.client_secret');

function newConnection(socket) {
	socket.on('Login', discordAuth.processLogin);

	socket.verifiedOn = (e, callback) => {
		socket.on(e, (payload, cb) => {
			nJwt.verify(payload.jwt, jwt_secret, (err, verifiedJwt) => {
				if (err) return cb({ error: 'Invalid token' });
				payload.jwt = verifiedJwt;
				payload.user = JSON.parse(verifiedJwt.body.sub);
				callback(payload, cb);
			});
		});
	};

	socket.verifiedOn('get token', (data, cb) => {
		db.getUserToken(data.user.id, (err, token) => {
			if (err) return cb({ error: err.message });
			cb({ message: 'success', data: JSON.parse(token) });
		});
	});

	socket.verifiedOn('set key', (data, cb) => {
		gw2.request('/v2/tokeninfo', data.data, (err, token) => {
			if (err) return cb({ error: err.message });
			db.setUserKey(data.user.id, data.data, token, (err) => {
				if (err) return cb({ error: err.message });
				cb({ mesage: 'success' });
			});
		});
	});
}

module.exports = function(http) {
	var io = require('socket.io')(http);
	io.on('connection', newConnection);
}
