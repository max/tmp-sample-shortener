exports.up = function(knex) {
  return knex.schema.createTable('urls', function(table) {
    table.increments('id').primary();
    table.string('short_id').notNullable().unique();
    table.string('original_url').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('urls');
};