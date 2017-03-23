var
	Promise = require('bluebird'),
	db = Promise.promisifyAll(require('../lib/db')),
	gw2 = require('../lib/gw2')
;

function delay(ms) {
	return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

module.exports = function(bot) {
	gw2.on('/v2/account', (account, key, from_cache) => {
		if (from_cache) return;
		Promise.all([
			gw2.getAllWorlds(),
			db.getUserByAccountAsync(account.name)
		]).then(results => {
			var worlds = results[0];
			var user = Promise.promisifyAll(bot.users.get('id', results[1]));
			var promises = [];
			bot.servers.forEach(server => {
				worlds.forEach(world => {
					var serverHasRole = server.roles.has('name', world.name);
					var role = (serverHasRole) ? server.roles.get('name', world.name) : null;
					var userHasRole = (serverHasRole) ? user.hasRole(role) : false;
					if (world.id === account.world) {
						if (! serverHasRole) {
							promises.push(() => server.createRoleAsync({ name: world.name, hoist: false, mentionable: true }));
						}
						if (! userHasRole) {
							promises.push(() => user.addToAsync(server.roles.get('name', world.name)));
						}
					} else {
						if (userHasRole)
							promises.push(() => user.removeFromAsync(role));
					}
				});
			});
			// Run through each promise sequentially with a short delay in between
			return promises.reduce((p,f) => p.then(f).then(() => delay(200)), Promise.resolve());
		}).catch(e => console.error(e.stack));
	});
};
