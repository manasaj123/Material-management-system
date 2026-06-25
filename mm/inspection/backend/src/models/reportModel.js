const db = require("../config/db");

exports.getReport = async () => {
  const [rows] = await db.query(
    "SELECT id, lot_number, status, created_at FROM lots"
  );
  return rows;
};
