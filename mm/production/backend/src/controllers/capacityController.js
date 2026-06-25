const db = require('../config/db');

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM capacity_plan WHERE plan_date = ? ORDER BY id',
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /capacity', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.save = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { date, rows } = req.body;
    
    await connection.beginTransaction();
    
    // Delete existing capacity plan for this date
    await connection.query('DELETE FROM capacity_plan WHERE plan_date = ?', [date]);
    
    // Insert new capacity rows
    if (rows && rows.length > 0) {
      for (const row of rows) {
        await connection.query(
          'INSERT INTO capacity_plan (plan_date, line_id, shift, available_hours) VALUES (?, ?, ?, ?)',
          [date, row.line_id, row.shift, row.available_hours]
        );
      }
    }
    
    await connection.commit();
    res.json({ message: 'Capacity saved', count: rows.length });
  } catch (err) {
    await connection.rollback();
    console.error('POST /capacity', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
};

exports.suggest = async (req, res) => {
  try {
    const { date } = req.body;
    
    // Get production plan for the date
    const [planRows] = await db.query(
      'SELECT * FROM production_plan WHERE plan_date = ? ORDER BY id',
      [date]
    );
    
    if (planRows.length === 0) {
      return res.status(404).json({ error: 'No production plan found for this date' });
    }
    
    // Delete existing capacity for this date
    await db.query('DELETE FROM capacity_plan WHERE plan_date = ?', [date]);
    
    // Create one capacity row per production plan line
    const capacityRows = planRows.map((plan, index) => ({
      plan_date: date,
      line_id: index + 1,
      shift: plan.shift,
      // Calculate available hours based on quantity (example: 8 hours per 100 units, minimum 1 hour)
      available_hours: Math.max(1, Math.ceil((parseFloat(plan.planned_qty) || 0) / 100) * 8)
    }));
    
    // Insert suggested capacity
    for (const row of capacityRows) {
      await db.query(
        'INSERT INTO capacity_plan (plan_date, line_id, shift, available_hours) VALUES (?, ?, ?, ?)',
        [row.plan_date, row.line_id, row.shift, row.available_hours]
      );
    }
    
    // Return the generated capacity plan
    const [generated] = await db.query(
      'SELECT * FROM capacity_plan WHERE plan_date = ? ORDER BY id',
      [date]
    );
    
    res.json({ 
      message: `Generated ${generated.length} capacity lines from ${planRows.length} production plan lines`,
      rows: generated
    });
  } catch (err) {
    console.error('POST /capacity/suggest', err);
    res.status(500).json({ error: 'Server error' });
  }
};