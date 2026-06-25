

const db = require('../config/db');

const Capacity = {
  async findByDate(planDate) {
    const [rows] = await db.query(
      'SELECT * FROM capacity_plan WHERE plan_date = ? ORDER BY line_id, shift',
      [planDate]
    );
    return rows;
  },

  async upsertMany(planDate, rows) {
    await db.query('DELETE FROM capacity_plan WHERE plan_date = ?', [planDate]);
    for (const row of rows) {
      await db.query(
        `INSERT INTO capacity_plan
          (plan_date, line_id, shift, available_hours)
         VALUES (?, ?, ?, ?)`,
        [planDate, row.line_id, row.shift, row.available_hours]
      );
    }
  }
};

module.exports = Capacity;
