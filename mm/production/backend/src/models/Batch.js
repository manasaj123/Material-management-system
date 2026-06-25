const db = require('../config/db');

const Batch = {
  async findByDate(planDate) {
    const [rows] = await db.query(
      'SELECT * FROM process_batches WHERE plan_date = ? ORDER BY id',
      [planDate]
    );
    return rows;
  },

  async createMany(planDate, rows) {
    for (const row of rows) {
      await db.query(
        `INSERT INTO process_batches
          (plan_date, product_id, grade_pack_id, batch_size, line_id, shift)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          planDate,
          row.product_id,
          row.grade_pack_id,
          row.batch_size,
          row.line_id,
          row.shift
        ]
      );
    }
  }
};

module.exports = Batch;
