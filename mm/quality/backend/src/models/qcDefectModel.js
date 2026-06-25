// backend/src/models/qcDefectModel.js
import db from "../config/db.js";

export const QCDefect = {
  async create(def) {
    const [res] = await db.query(
      `INSERT INTO qc_defects
       (lot_id, defect_type, qty_rejected, unit, severity, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        def.lot_id,
        def.defect_type,
        def.qty_rejected || 0,
        def.unit || null,
        def.severity || "MINOR",
        def.remarks || null
      ]
    );
    return res.insertId;
  },

  async listByLot(lotId) {
    const [rows] = await db.query(
      `SELECT * FROM qc_defects WHERE lot_id = ? ORDER BY id DESC`,
      [lotId]
    );
    return rows;
  }
};
export default QCDefect;