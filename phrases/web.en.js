var config = require('config');

var protocol = config.get('web.protocol');
var domain = config.get('web.domain');
var port = config.get('web.port');
var url = config.has('web.public_url') ? config.get('web.public_url') : protocol+"://"+domain+(((protocol === "http" && port !== "80") || (protocol === "https" && port !== "443")) ? ":"+port : "");

module.exports = {
	"WEB_HELP": "**__Web__**\n\nVisit on the web to review more detailed reports! "+url
}
