const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
<<<<<<< Updated upstream
  password: "root",
=======
  password: "root123",
>>>>>>> Stashed changes
  database: "inspection_db",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on("connection", () => {
  console.log("✅ MySQL pool connected");
});

module.exports = pool;