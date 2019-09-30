
/**
 * @param {import('knex')} knex
 */
exports.up = knex => knex.schema.createTable('objects', table => {
	table.string('name').notNullable().primary();
	table.json('object');
	table.dateTime('expires');
});

/**
 * @param {import('knex')} knex
 */
exports.down = knex => knex.schema.dropTable('objects');
