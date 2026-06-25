const db = require('../config/db');

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM production_plan WHERE plan_date = ? ORDER BY id',
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /plan', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.save = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { date, rows } = req.body;
    
    await connection.beginTransaction();
    
    // Delete existing plan for this date
    await connection.query('DELETE FROM production_plan WHERE plan_date = ?', [date]);
    
    // Insert new plan rows
    if (rows && rows.length > 0) {
      for (const row of rows) {
        await connection.query(
          'INSERT INTO production_plan (plan_date, shift, product_id, grade_pack_id, planned_qty, status) VALUES (?, ?, ?, ?, ?, ?)',
          [date, row.shift, row.product_id, row.grade_pack_id, row.planned_qty, row.status || 'planned']
        );
      }
    }
    
    await connection.commit();
    res.json({ message: 'Plan saved', count: rows.length });
  } catch (err) {
    await connection.rollback();
    console.error('POST /plan', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
};

exports.generateFromForecast = async (req, res) => {
  try {
    const { period, date } = req.body;
    
    // Get forecast for the period
    const [forecastRows] = await db.query(
      'SELECT * FROM demand_forecast WHERE period = ?',
      [period]
    );
    
    if (forecastRows.length === 0) {
      return res.status(404).json({ error: 'No forecast found for this period' });
    }
    
    // Delete existing plan for this date
    await db.query('DELETE FROM production_plan WHERE plan_date = ?', [date]);
    
    // Generate plan from forecast (simple 1:1 mapping, shift 1)
    const planRows = forecastRows.map((f, index) => ({
      plan_date: date,
      shift: 1,
      product_id: f.product_id,
      grade_pack_id: f.grade_pack_id,
      planned_qty: f.forecast_qty,
      status: 'planned'
    }));
    
    // Insert generated plan
    if (planRows.length > 0) {
      for (const row of planRows) {
        await db.query(
          'INSERT INTO production_plan (plan_date, shift, product_id, grade_pack_id, planned_qty, status) VALUES (?, ?, ?, ?, ?, ?)',
          [row.plan_date, row.shift, row.product_id, row.grade_pack_id, row.planned_qty, row.status]
        );
      }
    }
    
    // Return the generated plan
    const [generated] = await db.query(
      'SELECT * FROM production_plan WHERE plan_date = ? ORDER BY id',
      [date]
    );
    
    res.json({ 
      message: `Generated ${generated.length} plan lines from forecast period ${period}`,
      rows: generated
    });
  } catch (err) {
    console.error('POST /plan/generate', err);
    res.status(500).json({ error: 'Server error' });
  }
};