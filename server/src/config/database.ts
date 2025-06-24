import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number.parseInt(process.env.DB_PORT || "5432", 10);
const DB_USER = process.env.DB_USER || "P3_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "P3_db";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 120000,
    idle: 10000,
    evict: 1000,
  },
  dialectOptions: {},
  timezone: "+00:00",
});

export default sequelize;
