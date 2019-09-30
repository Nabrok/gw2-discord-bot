
/**
 * @param {import('knex')} knex
 */
exports.up = knex => knex.schema.createTable('response_cache', table => {
	table.string('path').notNullable();
	table.string('key').notNullable();
	table.json('response');
	table.dateTime('expires');
});

/**
 * @param {import('knex')} knex
 */
exports.down = knex => knex.schema.dropTable('response_cache');
