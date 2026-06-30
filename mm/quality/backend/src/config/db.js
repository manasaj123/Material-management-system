// backend/src/config/db.js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
<<<<<<< Updated upstream
  password: "root",
=======
  password: "root123",
>>>>>>> Stashed changes
  database: "quality_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;
