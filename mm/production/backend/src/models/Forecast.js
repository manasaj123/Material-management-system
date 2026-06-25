const db = require('../config/db');

const Forecast = {
  async findByPeriod(period) {
    const [rows] = await db.query(
      'SELECT * FROM demand_forecast WHERE period = ? ORDER BY id',
      [period]
    );
    return rows;
  },

  async upsertMany(period, rows) {
    await db.query('DELETE FROM demand_forecast WHERE period = ?', [period]);
    for (const row of rows) {
      await db.query(
        `INSERT INTO demand_forecast
          (period, product_id, grade_pack_id, forecast_qty)
         VALUES (?, ?, ?, ?)`,
        [period, row.product_id, row.grade_pack_id, row.forecast_qty]
      );
    }
  }
};

module.exports = Forecast;
