// backend/src/models/capaModel.js
import db from "../config/db.js";

export const CAPA = {
  async create(data) {
    const [res] = await db.query(
      `INSERT INTO capa
       (lot_id, defect_id, title, problem_desc, root_cause,
        corrective_actions, preventive_actions,
        owner, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.lot_id || null,
        data.defect_id || null,
        data.title,
        data.problem_desc || null,
        data.root_cause || null,
        data.corrective_actions || null,
        data.preventive_actions || null,
        data.owner || null,
        data.due_date || null,
        data.status || "OPEN"
      ]
    );
    return res.insertId;
  },

  async list(filter = {}) {
    const where = [];
    const params = [];
    if (filter.status) {
      where.push("status = ?");
      params.push(filter.status);
    }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await db.query(
      `SELECT * FROM capa ${whereSql} ORDER BY id DESC`,
      params
    );
    return rows;
  },

  async updateStatus(id, status) {
    await db.query(
      `UPDATE capa SET status = ? WHERE id = ?`,
      [status, id]
    );
  }
};
export default CAPA;