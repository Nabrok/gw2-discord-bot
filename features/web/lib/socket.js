var
	Promise = require('bluebird'),
	discordAuth = require('./discord-auth'),
	config = require('config'),
	nJwt = require('njwt'),
	db = Promise.promisifyAll(require('../../../lib/db')),
	gw2 = Promise.promisifyAll(require('../../../lib/gw2'))
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
		db.getUserTokenAsync(data.user.id)
			.then(token => cb({ message: 'success', data: JSON.parse(token) }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.verifiedOn('set key', (data, cb) => {
		gw2.requestAsync('/v2/tokeninfo', data.data)
			.then(token => db.setUserKeyAsync(data.user.id, data.data, token))
			.then(() => cb({ message: 'success' }))
			.catch(err => cb({ error: err.message }))
		;
	});
}

module.exports = function(http) {
	var io = require('socket.io')(http);
	io.on('connection', newConnection);
}
