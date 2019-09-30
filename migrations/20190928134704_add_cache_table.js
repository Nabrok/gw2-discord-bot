
/**
 * @param {import('knex')} knex
 */
exports.up = knex => knex.schema.createTable('cache', table => {
	table.string('name').notNullable();
	table.string('key').notNullable();
	table.json('object');
	table.dateTime('expires');
	table.unique(['name', 'key']);
});

/**
 * @param {import('knex')} knex
 */
exports.down = knex => knex.schema.dropTable('cache');
