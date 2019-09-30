const config = require('config');
const Knex = require('knex');

const knex = Knex(config.get('knex'));

const db = { };

async function clearExpired() {
	const now = new Date();
	await Promise.all([
		knex('response_cache').where('expires', '<', now).del(),
		knex('cache').where('expires', '<', now).del(),
		knex('objects').where('expires', '<', now).del()
	]);
}

clearExpired();
setInterval(clearExpired, 60 * 5 * 1000);

const subscriptions = [];

db.subscribe = callback => {
	if (subscriptions.indexOf(callback) === -1) subscriptions.push(callback);
};

function callSubscriptions(payload) {
	return subscriptions.reduce((p,f) => p.then(() => f(payload)), Promise.resolve());
}

db.knex = knex;

db.clearCache = cache_name => knex('cache').where('name', cache_name).del();

db.saveCachedResponse = async (path, key, response, ttl) => {
	const expires = new Date().getTime() + ttl;
	await knex('response_cache').where({ path, key }).del();
	return knex('response_cache').insert({ path, key, response: JSON.stringify(response), expires: new Date(expires) });
};

db.getCachedResponse = (path, key) => knex('response_cache').where({ path, key }).andWhere('expires', '>', new Date()).first().then(r => r ? JSON.parse(r.response) : null);

db.setUserKey = async (user_id, key, token) => {
	try {
		await knex('users').insert({ user_id, key, token: JSON.stringify(token) });
	} catch(err) {
		console.error(err);
		await knex('users').update({ key, token: JSON.stringify(token) }).where({ user_id });
	}
};

db.setUserAccount = (user_id, account) => knex('users').update({ account: JSON.stringify(account), account_name: account.name }).where({ user_id });

db.removeUser = async user_id => {
	await knex('users').where({ user_id }).del();
	await callSubscriptions({ type: 'removeUser', user_id });
};

db.getUserToken = user_id => knex.select('token').from('users').where({ user_id }).first().then(r => r ? JSON.parse(r.token) : null);

db.checkKeyPermission = async (user_id, permission) => {
	if (! Array.isArray(permission)) permission = [ permission ];
	if (permission.length === 0) return true;
	const token = await db.getUserToken(user_id);
	if (! token || ! token.permissions) return false;
	const has_perm = permission.every(p => (token.permissions.indexOf(p) > -1));
	return has_perm;
};

db.getUserKey = user_id => knex.select('key').from('users').where({ user_id }).first().then(r => r ? r.key : null);

db.getUserByAccount = account_name => knex.select('user_id').from('users').where({ account_name }).first().then(r => r ? r.user_id : null);

db.getAccountByUser = user_id => knex.select('account').from('users').where({ user_id }).first().then(r => r ? JSON.parse(r.account) : null);

db.setObject = async (name, object) => {
	await knex('objects').where({ name }).del();
	return knex('objects').insert({ name, object: JSON.stringify(object) });
};

db.getObject = name => knex('objects').where({ name }).andWhere(builder => {
	builder.where('expires', '>', new Date()).orWhereNull('expires');
}).first().then(r => r ? JSON.parse(r.object) : null);

db.expireObject = (name, seconds) => {
	const expires = new Date().getTime() + (seconds * 1000);
	return knex('objects').where({ name }).update({ expires: new Date(expires) });
};

db.getCacheKeys = name => knex.select('key').from('cache').where({ name }).then(r => r.map(c => c.key));

db.getCache = (name, keys) => knex('cache').whereIn('key', keys).andWhere({ name }).andWhere(builder => {
	builder.where('expires', '>', new Date()).orWhereNull('expires');
}).then(r => r.map(c => c ? c.object : null));

db.setCache = async (name, key, object) => {
	await knex('cache').where({ name, key }).del();
	return knex('cache').insert({ name, key, object: JSON.stringify(object) });
};

db.expireCache = (name, seconds) => {
	const expires = new Date().getTime() + (seconds * 1000);
	return knex('cache').whereNull('expires').andWhere({ name }).update({ expires: new Date(expires) });
};

module.exports = db;
