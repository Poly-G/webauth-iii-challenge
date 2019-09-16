module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./data/db.db3"
    },
    seeds: {
      directory: "./data/seeds"
    },
    migrations: {
      directory: "./data/migrations",
      tableName: "knex_migrations"
    },
    useNullAsDefault: true
  }
};
