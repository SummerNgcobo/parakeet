require("dotenv/config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  port: process.env.DB_PORT,
  pool_mode: "session",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Successfully connected to database");
    }
    catch (error) {
        throw new Error(error);
    }
}

module.exports = { sequelize, testConnection };