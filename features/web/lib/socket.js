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

function updateServers() {
	var users = Object.keys(socketIdMap);
	if (users.length === 0) return;
	setTimeout(() => {
		users.forEach(uid => {
			var servers = getCommonServers(uid);
			var sockets = socketIdMap[uid];
			Object.keys(sockets).forEach(sid => sockets[sid].emit('new discord servers', servers));
		});
	}, 500);
}

function updateChannels() {
	var users = Object.keys(socketIdMap);
	if (users.length === 0) return;
	setTimeout(() => {
		users.forEach(uid => {
			var channels = getCommonChannels(uid);
			var sockets = socketIdMap[uid];
			Object.keys(sockets).forEach(sid => sockets[sid].emit('new discord channels', channels));
		});
	}, 500);
}

function updateServerChannels(server, user) {
	var sockets = socketIdMap[user.id];
	if (! sockets) return;
	setTimeout(() => {
		var servers = getCommonServers(user.id);
		var channels = getCommonChannels(user.id);
		Object.keys(sockets).forEach(sid => {
			sockets[sid].emit('new discord servers', servers);
			sockets[sid].emit('new discord channels', channels);
		});
	}, 500);
}

function getCommonServers(userid) {
	return discord.servers
		.filter(s => s.members.find(m => m.id === userid))
		.map(s => ({ id: s.id, name: s.name, icon: s.iconURL }))
	;
}

function getCommonChannels(userid) {
	return discord.channels
		.filter(c => c.type === 'text') // only interested in text channels
		.filter(c => c.server.members.find(m => m.id === userid)) // user is member of server
		.filter(c => c.permissionsOf(userid).hasPermission("sendMessages")) // must be able to send to channel
		.map(c => ({ id: c.id, server: c.server.id, name: c.name, position: c.position }))
	;
}

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
			.then(() => getCommonServers(data.user.id))
			.then(servers => cb({ message: 'success', data: servers }))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get build string', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.requestAsync('/v2/characters/'+encodeURIComponent(data.data.name), key))
			.then(character => require('../../builds').getBuildString(character, data.data.type))
			.then(string => cb({ message: 'success', data: string }))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('post build string', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.requestAsync('/v2/characters/'+encodeURIComponent(data.data.name), key))
			.then(character => require('../../builds').getBuildString(character, data.data.type))
			.then(string => {
				var channel = discord.channels.get("id", data.data.channel);
				if (! channel) throw new Error("no such channel");
				channel.sendMessage(string);
			})
			.then(() => cb({ message: 'success' }))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('get equip string', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.requestAsync('/v2/characters/'+encodeURIComponent(data.data.name), key))
			.then(character => require('../../builds').getEquipString(character))
			.then(string => cb({ message: 'success', data: string }))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('post equip string', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.requestAsync('/v2/characters/'+encodeURIComponent(data.data.name), key))
			.then(character => require('../../builds').getEquipString(character, data.data.type))
			.then(string => {
				var channel = discord.channels.get("id", data.data.channel);
				if (! channel) throw new Error("no such channel");
				channel.sendMessage(string);
			})
			.then(() => cb({ message: 'success' }))
			.catch(err => cb({ error: err.message }))
	});


	socket.on('get discord channels', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => getCommonChannels(data.user.id))
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

	bot.on("serverCreated", updateServers);
	bot.on("serverUpdated", updateServers);
	bot.on("serverDeleted", updateServers);

	bot.on("channelCreated", updateChannels);
	bot.on("channelUpdated", updateChannels);
	bot.on("channelDeleted", updateChannels);

	bot.on("serverNewMember", updateServerChannels);
	bot.on("serverMemberRemoved", updateServerChannels);
	bot.on("serverMemberUpdated", updateServerChannels);
}
