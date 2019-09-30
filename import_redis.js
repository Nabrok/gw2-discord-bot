const knexconfig = require('./knexfile');
const knex = require('knex')(knexconfig);
const fs = require('fs');

const readJSON = file => new Promise((resolve, reject) => fs.readFile(file, (err, data) => err ? reject(err) : resolve(JSON.parse(data))));

const json_file = process.argv[2];
if (! json_file) {
	console.log(`Usage: import_redis.js [redis_dump_file]

To create the dump file run ...
npm install redis-dump -g
redis-dump -f "gw2_discord:*" --json > redis_dump.json
`);
}

async function main() {
	const redis = await readJSON(json_file);
	await knex.migrate.latest();
	const users = Object.entries(redis['gw2_discord:user_keys'].value).map(([user_id, key]) => {
		let account, token;
		try {
			account = JSON.parse(redis['gw2_discord:user_ids'].value[user_id]);
		} catch(error) {
			console.warn(`${user_id}: Can't read account data "${redis['gw2_discord:user_ids'].value[user_id]}" - ${error.message}`);
		}
		token = JSON.parse(redis['gw2_discord:user_tokens:'+user_id].value);
		const user = { user_id, key, token: JSON.stringify(token), account: JSON.stringify(account) };
		if (account) user.account_name = account.name;
		return user;
	});
	console.log(`${users.length} users found.`);
	await knex.transaction(async trx => {
		for (let i = 0; i < users.length; i++) {
			await trx('users').insert(users[i]).catch(err => {
				console.error(`User ${users[i].user_id}: ${err.code}`);
			});
		}
	});
	knex.destroy();
	console.log('done');
}

main().catch(console.error);
