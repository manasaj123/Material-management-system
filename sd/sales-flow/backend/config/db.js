const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "sales_order_fullstack_db",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: false
  }
);

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected via Sequelize");
  } catch (err) {
    console.error("Unable to connect to DB:", err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDb };
