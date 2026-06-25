const db = require('../config/db');

const Metric = {
  async daily(planDate) {
    const [rows] = await db.query(
      `SELECT
         plan_date,
         SUM(planned_qty) AS total_planned,
         SUM(actual_qty) AS total_actual,
         SUM(wastage_qty) AS total_wastage,
         CASE WHEN SUM(planned_qty) > 0
              THEN ROUND(SUM(actual_qty) / SUM(planned_qty) * 100, 2)
              ELSE 0 END AS yield_percent
       FROM work_orders
       WHERE plan_date = ?
       GROUP BY plan_date`,
      [planDate]
    );
    return rows[0] || null;
  }
};

module.exports = Metric;
