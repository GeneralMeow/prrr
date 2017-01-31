exports.up = knex =>
  knex.schema.createTable('unclaimed_prrrs', table => {
    table.integer('prrr_id').notNullable()
    table.string('github_username').notNullable()
    table.timestamp('unclaimed_at').notNullable()
    table.unique(['prrr_id', 'github_username'])
  })

exports.down = knex =>
  knex.schema.dropTable('unclaimed_prrrs')
