import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('rentals', (table) => {
    table.increments('id').primary();
    table
      .integer('vehicle_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('vehicles')
      .onDelete('RESTRICT');
    table.string('customer_name', 255).notNullable();
    table.string('customer_phone', 50).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.decimal('total_amount', 10, 2).notNullable();
    table
      .enum('status', ['booked', 'ongoing', 'completed', 'cancelled'])
      .notNullable()
      .defaultTo('booked');
    table.timestamps(true, true);

    table.index(['vehicle_id']);
    table.index(['status']);
    table.index(['start_date', 'end_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('rentals');
}
