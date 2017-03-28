var
	Promise = require('bluebird'),
	db = Promise.promisifyAll(require('../lib/db')),
	gw2 = require('../lib/gw2')
;

function delay(ms) {
	return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

var sub = db.subscribe("user_tokens:*");

module.exports = function(bot) {
	// This event will fire when a user token is removed from the database
	sub.on("pmessage", (pattern, channel, message) => {
		if (message !== 'del') return;
		var parts = channel.split(':');
		var key = parts[2], userid = parts[3];
		if (key !== "user_tokens") return;
		if (! userid) return;
		gw2.getAllWorlds()
		.then(worlds => {
			var promises = [];
			bot.guilds.forEach(server => {
				var user = server.members.get(userid);
				if (! user) return;
				worlds.forEach(world => {
					var serverHasRole = server.roles.exists('name', world.name);
					if (! serverHasRole) return;
					var role = (serverHasRole) ? server.roles.find('name', world.name) : null;
					var userHasRole = (serverHasRole) ? user.roles.has(role.id) : false;
					if (! userHasRole) return;
					promises.push(() => user.removeRole(role));
				});
			});
			return promises.reduce((p,f) => p.then(f).then(() => delay(200)), Promise.resolve());
		})
		.catch(err => {
			console.error('Error removing invalid user from world roles: '+err.message);
		});
	});

	gw2.on('/v2/account', (account, key, from_cache) => {
		//if (from_cache) return;
		Promise.all([
			gw2.getAllWorlds(),
			db.getUserByAccountAsync(account.name)
		]).then(results => {
			var worlds = results[0];
			var user_id = results[1];
			if (! user_id) return;
			var promises = [];
			bot.guilds.forEach(server => {
				var user = server.members.get(user_id);
				if (! user) {
					console.error(`World Roles: User ${user_id} is not on server %{server.name}`);
					return;
				}
				worlds.forEach(world => {
					var serverHasRole = server.roles.exists('name', world.name);
					var role = (serverHasRole) ? server.roles.find('name', world.name) : null;
					var userHasRole = (serverHasRole) ? user.roles.has(role.id) : false;
					if (world.id === account.world) {
						if (! serverHasRole) {
							promises.push(() => server.createRole({ name: world.name, hoist: false, mentionable: true }));
						}
						if (! userHasRole) {
							promises.push(() => user.addRole(server.roles.find('name', world.name)));
						}
					} else {
						if (userHasRole) {
							promises.push(() => user.removeRole(role));
						}
					}
				});
			});
			// Run through each promise sequentially with a short delay in between
			return promises.reduce((p,f) => p.then(f).then(() => delay(200)), Promise.resolve());
		}).catch(e => console.error(e.stack));
	});
};
