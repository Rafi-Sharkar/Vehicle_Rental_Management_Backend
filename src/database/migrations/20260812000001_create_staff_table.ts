import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('staff', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.text('password_hash').notNullable();
    table.string('name', 255).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('staff');
}
