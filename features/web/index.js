var
	express = require('express'),
	path = require('path'),
	config = require('config'),
	discordAuth = require('./lib/discord-auth')
;

var protocol = config.has('web.protocol') ? config.get('web.protocol') : 'http';
var http_port = config.get('web.port');
var domain = config.get('web.domain');

var app = express();
var http = require('http').Server(app);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
	var uri = discordAuth.getUri();
	res.redirect(uri);
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

http.listen(http_port, function() {
	console.log('http listening on port '+http_port+'!');
});

module.exports = function(bot) {
	require('./lib/socket')(http, bot);
};
