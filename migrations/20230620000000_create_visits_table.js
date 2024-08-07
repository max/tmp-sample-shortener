exports.up = function(knex) {
  return knex.schema.createTable('visits', function(table) {
    table.increments('id').primary();
    table.integer('url_id').unsigned().notNullable();
    table.foreign('url_id').references('urls.id');
    table.string('ip_address').notNullable();
    table.string('user_agent');
    table.string('referrer');
    table.timestamp('visited_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('visits');
};