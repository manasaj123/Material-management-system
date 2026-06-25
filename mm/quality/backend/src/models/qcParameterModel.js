// backend/src/models/qcParameterModel.js
import db from "../config/db.js";

export const QCParameter = {
  async list() {
    const [rows] = await db.query(
      `SELECT * FROM qc_parameters ORDER BY sort_order, id`
    );
    return rows;
  }
};
export default QCParameter;