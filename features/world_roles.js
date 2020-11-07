var
	Promise = require('bluebird'),
	db = require('../lib/database'),
	gw2 = require('../lib/gw2')
;

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = function(bot) {
	db.subscribe(async action => {
		if (action.type !== 'removeUser') return;
		const worlds = await gw2.getAllWorlds();
		const promises = [];
		await Promise.all(bot.guilds.map(async server => {
			const user = await server.fetchMember(action.user_id);
			if (! user) return;
			worlds.forEach(world => {
				const server_has_role = server.roles.some(r => r.name === world.name);
				if (! server_has_role) return;
				const role = server.roles.find(r => r.name === world.name);
				const user_has_role = user.roles.has(role.id);
				if (! user_has_role) return;
				promises.push(() => user.removeRole(role));
			});
		}));
		return promises.reduce((p,f) => p.then(f).then(() => delay(200)), Promise.resolve());
	});

	gw2.on('/v2/account', account => {
		Promise.all([
			gw2.getAllWorlds(),
			db.getUserByAccount(account.name)
		]).then(async ([worlds, user_id]) => {
			if (! user_id) return;
			const promises = [];
			await Promise.all(bot.guilds.map(async server => {
				const user = await server.fetchMember(user_id);
				if (! user) {
					console.error(`World Roles: User ${user_id} is not on server %{server.name}`);
					return;
				}
				worlds.forEach(world => {
					const role = server.roles.find(r => r.name === world.name);
					const userHasRole = role ? user.roles.has(role.id) : false;
					if (world.id === account.world) {
						if (! role) {
							promises.push(() => server.createRole({ name: world.name, hoist: false, mentionable: true }));
						}
						if (! userHasRole) {
							promises.push(() => user.addRole(server.roles.find(r => r.name === world.name)));
						}
					} else {
						if (userHasRole) {
							promises.push(() => user.removeRole(role));
						}
					}
				});
			}));
			// Run through each promise sequentially with a short delay in between
			return promises.reduce((p,f) => p.then(f).then(() => delay(200)), Promise.resolve());
		}).catch(e => console.error(e.stack));
	});
};
