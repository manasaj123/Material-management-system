// backend/src/models/qcResultModel.js
import db from "../config/db.js";

export const QCResult = {
  async saveResults(lotId, results = []) {
    if (!results.length) return;

    const values = results.map(r => [
      lotId,
      r.parameter_id,
      r.measured_value,
      r.unit || null,
      r.pass_fail ? 1 : 0,
      r.remark || null
    ]);

    await db.query(
      `INSERT INTO qc_results
       (lot_id, parameter_id, measured_value, unit, pass_fail, remark)
       VALUES ?`,
      [values]
    );
  },

  async listByLot(lotId) {
    const [rows] = await db.query(
      `SELECT qr.*, qp.name AS parameter_name
       FROM qc_results qr
       JOIN qc_parameters qp ON qp.id = qr.parameter_id
       WHERE qr.lot_id = ?`,
      [lotId]
    );
    return rows;
  }
};
export default QCResult;