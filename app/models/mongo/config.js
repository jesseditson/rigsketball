var dbName = process.env.DB_NAME || 'rigsketball2015'

var config = {
  db : dbName,
  database: dbName,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 27017,
  hosts : [
    {
      name: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 27017
    }
  ]
}

if (process.env.DB_USER) {
  config.username = process.env.DB_USER
  config.password = process.env.DB_PASSWORD
}

module.exports = config;
