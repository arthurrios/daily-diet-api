import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('meals', (table) => {
    table.uuid('user_id').references('id').inTable('users').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('meals', (table) => {
    table.dropColumn('user_id')
  })
}
