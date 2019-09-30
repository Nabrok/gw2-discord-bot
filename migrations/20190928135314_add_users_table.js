
/**
 * @param {import('knex')} knex
 */
exports.up = knex => knex.schema.createTable('users', table => {
	table.string('user_id').notNullable().primary();
	table.string('key').notNullable().unique();
	table.json('token');
	table.string('account');
	table.string('account_name').unique();
});

/**
 * @param {import('knex')} knex
 */
exports.down = knex => knex.schema.dropTable('users');
