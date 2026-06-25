import db from "../config/db.js";

export const MaterialQCTemplate = {
  async listByMaterial(materialId) {
    const [rows] = await db.query(
      `SELECT * FROM material_qc_templates 
       WHERE material_id = ? 
       ORDER BY id`,
      [materialId]
    );
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO material_qc_templates 
       (material_id, parameter_name, unit, lower_spec_limit, upper_spec_limit, required)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.material_id,
        data.parameter_name,
        data.unit,
        data.lower_spec_limit,
        data.upper_spec_limit,
        data.required ? 1 : 0
      ]
    );
    return result.insertId;
  },

  async deleteByMaterial(materialId) {
    await db.query(
      'DELETE FROM material_qc_templates WHERE material_id = ?',
      [materialId]
    );
  }
};