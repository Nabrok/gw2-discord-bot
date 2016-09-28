var
	Promise = require('bluebird'),
	discordAuth = require('./discord-auth'),
	config = require('config'),
	nJwt = Promise.promisifyAll(require('njwt')),
	db = Promise.promisifyAll(require('../../../lib/db')),
	gw2 = Promise.promisifyAll(require('../../../lib/gw2'))
;

var jwt_secret = config.has('web.jwt_secret') ? config.get('web.jwt_secret') : config.get('discord.client_secret');

function verifyJwt(data) {
	return nJwt.verifyAsync(data.jwt, jwt_secret).then(verifiedJwt => {
		data.jwt = verifiedJwt;
		data.user = JSON.parse(verifiedJwt.body.sub);
		return data;
	}).catch(e => {
		throw new Error('Invalid token');
	});
}

function newConnection(socket) {
	socket.on('Login', discordAuth.processLogin);

	socket.on('get token', (data, cb) => {
		verifyJwt(data)
			.then(() => db.getUserTokenAsync(data.user.id))
			.then(token => cb({ message: 'success', data: JSON.parse(token) }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('set key', (data, cb) => {
		verifyJwt(data)
			.then(() => gw2.requestAsync('/v2/tokeninfo', data.data))
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
