import mysql from "mysql2";
import { config } from "./config.js";

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("MySQL connected");
    conn.release();
  }
});

export default pool.promise();
