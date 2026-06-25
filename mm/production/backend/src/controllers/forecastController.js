const db = require('../config/db');

exports.getByPeriod = async (req, res) => {
  try {
    const { period } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM demand_forecast WHERE period = ? ORDER BY product_id, grade_pack_id',
      [period]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /forecast', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.save = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { period, rows } = req.body;
    
    await connection.beginTransaction();
    
    // Delete existing forecast for this period
    await connection.query('DELETE FROM demand_forecast WHERE period = ?', [period]);
    
    // Insert new forecast rows
    if (rows && rows.length > 0) {
      for (const row of rows) {
        await connection.query(
          'INSERT INTO demand_forecast (period, product_id, grade_pack_id, forecast_qty) VALUES (?, ?, ?, ?)',
          [period, row.product_id, row.grade_pack_id, row.forecast_qty]
        );
      }
    }
    
    await connection.commit();
    res.json({ message: 'Forecast saved', count: rows.length });
  } catch (err) {
    await connection.rollback();
    console.error('POST /forecast', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
};