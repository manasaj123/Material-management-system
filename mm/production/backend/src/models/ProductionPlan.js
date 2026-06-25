const db = require('../config/db');

const ProductionPlan = {
  async findByDate(planDate) {
    const [rows] = await db.query(
      'SELECT * FROM production_plan WHERE plan_date = ? ORDER BY id',
      [planDate]
    );
    return rows;
  },

  async upsertMany(planDate, rows) {
    await db.query('DELETE FROM production_plan WHERE plan_date = ?', [planDate]);
    for (const row of rows) {
      await db.query(
        `INSERT INTO production_plan
          (plan_date, shift, product_id, grade_pack_id, planned_qty, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          planDate,
          row.shift,
          row.product_id,
          row.grade_pack_id,
          row.planned_qty,
          row.status || 'draft'
        ]
      );
    }
  }
};

module.exports = ProductionPlan;
