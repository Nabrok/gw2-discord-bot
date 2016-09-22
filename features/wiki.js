var
	async = require('async'),
	config = require('config'),
	MWBot = require('mwbot'),
  toMarkdown = require('to-markdown'),
  phrases = require('../lib/phrases')
;

var wiki = new MWBot({
  apiUrl: 'https://wiki.guildwars2.com/api.php'
});

function messageReceived(message) {
  var match;
	if (match = message.content.match(new RegExp('^!'+phrases.get("WIKI_WIKI")+' ?(.*)?$', 'i'))) {
    async.waterfall([
      function(next) { message.channel.startTyping(next); },
      function(something, next) {
        var term = match[1];
        if (term) {
          wiki.request({
            action: 'parse',
            page: term,
            redirects: true,
            prop: 'text'
          }).then((response) => {
            var text = response.parse.text['*'];
            if (text) {
              text = toMarkdown(text, {
                converters: [
                  { // Convert various stuff to plain-text
                    filter: ['a', 'small'],
                    replacement: function(innerHTML, node) {
                      return innerHTML;
                    }
                  },
                  { // Filter out all unwanted tags
                    filter: function(node) {
                      return !node.nodeName.match(/^(b|strong|i|em|s|del|p)$/i);
                    },
                    replacement: function(innerHTML, node) {
                      return '';
                    }
                  }
                ]
              }).split("\n")[0].trim();
              if (text) {
                text += "\n\n"+phrases.get("WIKI_MORE", { url: encodeURI("https://wiki.guildwars2.com/wiki/"+response.parse.title)});
              } else {
                text = encodeURI("https://wiki.guildwars2.com/wiki/"+response.parse.title);
              }
              next(null, text);
            } else {
              next(null, phrases.get("WIKI_NOT_FOUND"));
            }
          }).catch((error) => {
            if (error.code == 'missingtitle') {
              next(null, phrases.get("WIKI_NOT_FOUND"));
            } else {
              next(null, phrases.get("WIKI_ERROR", { error: error.info ? error.info : '' }));
            }
          });
        } else {
          next(null, phrases.get("WIKI_NO_TERM"));
        }
      }
    ], function(err, result) {
      message.channel.stopTyping(function() {
        message.reply(result);
      });
    });
	}
}

module.exports = function(bot) {
	bot.on("message", messageReceived);
};
