var
	Promise = require('bluebird'),
	discordAuth = Promise.promisifyAll(require('./discord-auth')),
	config = require('config'),
	nJwt = Promise.promisifyAll(require('njwt')),
	db = Promise.promisifyAll(require('../../../lib/db')),
	gw2 = Promise.promisifyAll(require('../../../lib/gw2'))
;

var jwt_secret = config.has('web.jwt_secret') ? config.get('web.jwt_secret') : config.get('discord.client_secret');

var discord;
var socketIdMap = {};

var sub = db.subscribe("user_tokens:*");
db.subscribe("privacy:*");

sub.on("pmessage", (pattern, channel, message) => {
	var parts = channel.split(':');
	var key = parts[2], userid = parts[3];
	if (! userid) return;
	var sockets = socketIdMap[userid];
	if (! sockets) return;
	if (key === "user_tokens") {
		db.getUserTokenAsync(userid)
			.then(token => {
				Object.keys(sockets).forEach(sid => {
					var socket = sockets[sid];
					socket.emit('new token', JSON.parse(token));
				});
			})
		;
	}
	if (key === "privacy") {
		db.getObjectAsync('privacy:'+userid)
			.then(privacy => {
				Object.keys(sockets).forEach(sid => {
					sockets[sid].emit('new privacy', privacy);
				});
			})
		;
	}
});

function verifyJwt(data, socket) {
	return nJwt.verifyAsync(data.jwt, jwt_secret).then(verifiedJwt => {
		data.jwt = verifiedJwt;
		data.user = JSON.parse(verifiedJwt.body.sub);
		if (! socketIdMap[data.user.id]) socketIdMap[data.user.id] = {};
		socketIdMap[data.user.id][socket.id] = socket;
		return data;
	}).catch(e => {
		throw new Error('Invalid token');
	});
}

function newConnection(socket) {
	socket.on('Login', (code, cb) => {
		discordAuth.processLoginAsync(code)
			.then(result => {
				if (! socketIdMap[result.id]) socketIdMap[result.id] = {};
				socketIdMap[result.id][socket.id] = socket;
				var jwt = nJwt.create({ sub: JSON.stringify(result) }, jwt_secret);
				cb({ message: 'success', jwt: jwt.compact() });
			})
			.catch(err => {
				console.log(err.message);
				cb({ error: err.message });
			})
		;
	});

	socket.on('get token', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserTokenAsync(data.user.id))
			.then(token => cb({ message: 'success', data: JSON.parse(token) }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get key permissions', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserTokenAsync(data.user.id))
			.then(token => JSON.parse(token))
			.then(token => cb({ message: 'success', data: token.permissions }))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('set key', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => gw2.requestAsync('/v2/tokeninfo', data.data))
			.then(token => db.setUserKeyAsync(data.user.id, data.data, token))
			.then(() => cb({ message: 'success' }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get characters', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.requestAsync('/v2/characters', key))
			.then(characters => cb({ message: 'success', data: characters }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get character', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.requestAsync('/v2/characters/'+encodeURIComponent(data.data), key))
			.then(character => cb({ message: 'success', data: character }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get privacy', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getObjectAsync('privacy:'+data.user.id))
			.then(privacy => cb({ message: 'success', data: privacy }))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('set privacy', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getObjectAsync('privacy:'+data.user.id))
			.then(privacy => db.setObjectAsync('privacy:'+data.user.id, !!privacy ? Object.assign(privacy, data.data) : data.data))
			.then(() => cb({ message: 'success' }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get discord servers', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => {
				var servers = discord.servers.filter(s => s.members.find(m => m.id === data.user.id)).map(s => ({ id: s.id, name: s.name, icon: s.iconURL }));
				console.log(servers);
				return servers;
			})
			.then(servers => cb({ message: 'success', data: servers }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get discord channels', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => {
				var channels = discord.channels
					.filter(c => c.type === 'text') // only interested in text channels
					.filter(c => c.server.members.find(m => m.id === data.user.id)) // user is member of server
					.filter(c => c.permissionsOf(data.user.id).hasPermission("sendMessages")) // must be able to send to channel
					.map(c => ({ id: c.id, server: c.server.id, name: c.name, position: c.position }))
				;
				console.log(channels);
				return channels;
			})
			.then(channels => cb({ message: 'success', data: channels }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('disconnect', () => {
		var userid = Object.keys(socketIdMap).find(i => Object.keys(socketIdMap[i]).some(s => s === socket.id));
		if (! userid) return;
		delete socketIdMap[userid][socket.id];
		if (Object.keys(socketIdMap[userid]).length === 0) delete socketIdMap[userid];
	});
}

module.exports = function(http, bot) {
	discord = bot;
	var io = require('socket.io')(http);
	io.on('connection', newConnection);
}
