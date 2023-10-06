const { DataSource } = require("typeorm");
const dotenv = require("dotenv");

dotenv.config()

const AppDataSource = new DataSource({
  type: "postgres",
  port: 5432,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  entities: [
  ],
  migrations: [
    "dist/migrations/*.js",
  ],
})

module.exports = {
  datasource: AppDataSource,
}