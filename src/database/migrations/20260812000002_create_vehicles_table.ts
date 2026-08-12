import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('vehicles', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('plate_number', 50).notNullable().unique();
    table.string('category', 100).notNullable();
    table.decimal('daily_rate', 10, 2).notNullable();
    table.text('photo_path').nullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index(['category']);
    table.index(['deleted_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('vehicles');
}
