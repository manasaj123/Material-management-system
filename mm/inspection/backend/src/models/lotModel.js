const db = require("../config/db");

exports.getLots = async () => {
  const [rows] = await db.query(
    "SELECT * FROM lots ORDER BY created_at DESC"
  );
  return rows;
};

exports.createLot = async data => {
  const [result] = await db.query(
    `INSERT INTO lots 
     (lot_number, product_name, quantity, unit, status)
     VALUES (?, ?, ?, ?, 'PENDING')`,
    [
      data.lot_number,
      data.product_name,
      data.quantity,
      data.unit
    ]
  );
  return result.insertId;
};

exports.updateStatus = async (id, status) => {
  await db.query(
    "UPDATE lots SET status = ? WHERE id = ?",
    [status, id]
  );
};
