const db = require('../config/db');

const MrpRequirement = {
  async deleteByDate(planDate) {
    await db.query('DELETE FROM mrp_requirements WHERE need_date = ?', [planDate]);
  },

  async insertMany(planDate, rows) {
    for (const row of rows) {
      await db.query(
        `INSERT INTO mrp_requirements
          (need_date, product_id, grade_pack_id, material_id, required_qty, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          planDate,
          row.product_id,
          row.grade_pack_id,
          row.material_id,
          row.required_qty,
          row.status || 'open'
        ]
      );
    }
  },

  async countByDate(planDate) {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS cnt FROM mrp_requirements WHERE need_date = ?',
      [planDate]
    );
    return rows[0]?.cnt || 0;
  }
};

module.exports = MrpRequirement;
