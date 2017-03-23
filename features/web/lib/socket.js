var
	Promise = require('bluebird'),
	discordAuth = Promise.promisifyAll(require('./discord-auth')),
	config = require('config'),
	nJwt = Promise.promisifyAll(require('njwt')),
	db = Promise.promisifyAll(require('../../../lib/db')),
	gw2 = require('../../../lib/gw2')
;

var jwt_secret = config.has('web.jwt_secret') ? config.get('web.jwt_secret') : config.get('discord.client_secret');

var discord;
var socketIdMap = {};

var sub = db.subscribe("user_tokens:*");
db.subscribe("privacy:*");
db.subscribe("session_archive:*");

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
	if (key === "session_archive") {
		db.findObjectsAsync('session_archive:'+userid+':*')
		.then(data => Object.keys(sockets).forEach(sid => sockets[sid].emit('new sessions', data)));
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
	var servers = discord.guilds
		.filter(s => s.members.has(userid))
		.map(s => ({ id: s.id, name: s.name, icon: s.iconURL }))
	;
	return servers;
}

function getCommonChannels(userid) {
	var channels = [];
	discord.guilds.forEach(guild => {
		var user = guild.members.get(userid);
		channels = channels.concat(guild.channels
			.filter(c => c.type === 'text') // only interested in text channels
			.filter(c => c.members.has(userid)) // user is member of server
			.filter(c => c.permissionsFor(user).hasPermission("SEND_MESSAGES")) // must be able to send to channel
			.map(c => ({ id: c.id, server: guild.id, name: c.name, position: c.position }))
		);
	});
	return channels;
}

function verifyJwt(data, socket) {
	return nJwt.verifyAsync(data.jwt, jwt_secret).then(verifiedJwt => {
		var issued = new Date(verifiedJwt.body.iat * 1000);
		var time_since_issue = new Date() - issued;
		if (time_since_issue > 60000)
			data.jwt = nJwt.create({ sub: verifiedJwt.body.sub }, jwt_secret);
		else delete data.jwt;
		data.user = JSON.parse(verifiedJwt.body.sub);
		if (! socketIdMap[data.user.id]) socketIdMap[data.user.id] = {};
		socketIdMap[data.user.id][socket.id] = socket;
		return data;
	}).catch(e => {
		throw new Error('Invalid token');
	});
}

function returnData(jwt, data) {
	var output = { message: 'success' };
	if (jwt) output.jwt = jwt.compact();
	if (data) output.data = data;
	return output;
}

function newConnection(socket) {
	socket.on('Login', (code, cb) => {
		discordAuth.processLoginAsync(code)
			.then(result => {
				if (! socketIdMap[result.id]) socketIdMap[result.id] = {};
				socketIdMap[result.id][socket.id] = socket;
				var jwt = nJwt.create({ sub: JSON.stringify(result) }, jwt_secret);
				cb(returnData(jwt))
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
			.then(token => cb(returnData(data.jwt, JSON.parse(token))))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get key permissions', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserTokenAsync(data.user.id))
			.then(token => JSON.parse(token))
			.then(token => cb(returnData(data.jwt, token.permissions)))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('set key', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => gw2.request('/v2/tokeninfo', data.data))
			.then(token => db.setUserKeyAsync(data.user.id, data.data, token))
			.then(() => cb(returnData(data.jwt)))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get characters', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.request('/v2/characters', key))
			.then(characters => cb(returnData(data.jwt, characters)))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get character', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.request('/v2/characters/'+encodeURIComponent(data.data), key))
			.then(character => cb(returnData(data.jwt, character)))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get privacy', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getObjectAsync('privacy:'+data.user.id))
			.then(privacy => cb(returnData(data.jwt, privacy)))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('set privacy', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getObjectAsync('privacy:'+data.user.id))
			.then(privacy => db.setObjectAsync('privacy:'+data.user.id, !!privacy ? Object.assign(privacy, data.data) : data.data))
			.then(() => cb(returnData(data.jwt)))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get discord servers', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => getCommonServers(data.user.id))
			.then(servers => cb(returnData(data.jwt, servers)))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get build string', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.request('/v2/characters/'+encodeURIComponent(data.data.name), key))
			.then(character => require('../../builds').getBuildString(character, data.data.type))
			.then(string => cb(returnData(data.jwt, string)))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('post build string', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.request('/v2/characters/'+encodeURIComponent(data.data.name), key))
			.then(character => require('../../builds').getBuildString(character, data.data.type))
			.then(string => {
				var channel = discord.channels.get(data.data.channel);
				if (! channel) throw new Error("no such channel");
				channel.sendMessage(string);
			})
			.then(() => cb(returnData(data.jwt)))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('get equip string', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.request('/v2/characters/'+encodeURIComponent(data.data.name), key))
			.then(character => require('../../builds').getEquipString(character))
			.then(string => cb(returnData(data.jwt, string)))
			.catch(err => cb({ error: err.message }))
	});

	socket.on('post equip string', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => db.getUserKeyAsync(data.user.id))
			.then(key => gw2.request('/v2/characters/'+encodeURIComponent(data.data.name), key))
			.then(character => require('../../builds').getEquipString(character, data.data.type))
			.then(string => {
				var channel = discord.channels.get(data.data.channel);
				if (! channel) throw new Error("no such channel");
				channel.sendMessage(string);
			})
			.then(() => cb(returnData(data.jwt)))
			.catch(err => cb({ error: err.message }))
	});


	socket.on('get discord channels', (data, cb) => {
		verifyJwt(data, socket)
			.then(() => getCommonChannels(data.user.id))
			.then(channels => cb(returnData(data.jwt, channels)))
			.catch(err => cb({ error: err.message }))
		;
	});

	socket.on('get sessions', (data, cb) => {
		verifyJwt(data, socket)
		.then(() => db.findObjectsAsync('session_archive:'+data.user.id+':*'))
		.then(sessions => cb(returnData(data.jwt, sessions)))
		.catch(err => cb({ error: err.message }));
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

	bot.on("guildCreate", updateServers);
	bot.on("guildUpdate", updateServers);
	bot.on("guildDelete", updateServers);

	bot.on("channelCreate", updateChannels);
	bot.on("channelUpdate", updateChannels);
	bot.on("channelDelete", updateChannels);

	bot.on("guildMemberAdd", updateServerChannels);
	bot.on("guildMemberRemove", updateServerChannels);
	bot.on("guildMemberUpdate", updateServerChannels);
}
