const db = require('../config/db');

const WorkOrder = {
  async findByDate(planDate) {
    const [rows] = await db.query(
      'SELECT * FROM work_orders WHERE plan_date = ? ORDER BY id',
      [planDate]
    );
    return rows;
  },

  async create(data) {
    const [res] = await db.query(
      `INSERT INTO work_orders
        (plan_date, batch_id, line_id, shift, product_id, grade_pack_id,
         planned_qty, actual_qty, wastage_qty, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.plan_date,
        data.batch_id,
        data.line_id,
        data.shift,
        data.product_id,
        data.grade_pack_id,
        data.planned_qty,
        data.actual_qty || 0,
        data.wastage_qty || 0,
        data.status || 'open'
      ]
    );
    return { id: res.insertId };
  },

  async updateActual(id, actual_qty, wastage_qty, status) {
    await db.query(
      `UPDATE work_orders
       SET actual_qty = ?, wastage_qty = ?, status = ?
       WHERE id = ?`,
      [actual_qty, wastage_qty, status, id]
    );
  }
};

module.exports = WorkOrder;
