var
	config = require('config')
;

var language = config.has('features.language') ? config.get('features.language') : "en";
var features = config.has('features.enabled') ? config.get('features.enabled').slice() : [];
if (features.indexOf("link") === -1) features.push("link");
if (features.indexOf("core") === -1) features.push("core");

var list = {};
var phrases = {};

var checkFileError = function(e) {
	if (e instanceof Error && e.code === "MODULE_NOT_FOUND") {
		// Safe to ignore
	} else {
		// Something bad
		throw e;
	}
}

features.forEach(feature => {
	// Load english first so that any new phrases have a default
	try { Object.assign(list, require('../phrases/'+feature+'.en')); } catch (e) { checkFileError(e); }
	// Load language specific over-rides
	if (language !== "en") {
		try { Object.assign(list, require('../phrases/'+feature+'.'+language)); } catch (e) { checkFileError(e); }
	}
});
// Any local changes (ignored by git)
try { Object.assign(list, require('../phrases/local')); } catch (e) { checkFileError(e); }

phrases.get = function(phrase, vars) {
	var string = list[phrase] || "";
	if (vars) Object.keys(vars).forEach(v => {
		var re = new RegExp('%{'+v+'}', 'ig');
		string = string.replace(re, vars[v]);
	});
	return string;
};

module.exports = phrases;
