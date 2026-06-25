const db = require("../config/db");


exports.saveResult = async (lotId, status, findings = "") => {
  await db.query(
    `INSERT INTO qc_results (lot_id, status, findings)
     VALUES (?, ?, ?)`,
    [lotId, status, findings]
  );
};


exports.getResultsByLotId = async lotId => {
  const [rows] = await db.query(
    "SELECT * FROM qc_results WHERE lot_id = ?",
    [lotId]
  );
  return rows;
};
