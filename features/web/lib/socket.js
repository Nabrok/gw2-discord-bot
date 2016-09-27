var
	discordAuth = require('./discord-auth')
;

module.exports = function(io) {
	io.on('connection', socket => {
		socket.on('Login', discordAuth.processLogin);
	});
}
