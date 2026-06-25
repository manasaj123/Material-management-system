const db = require('../config/db');

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM work_orders WHERE plan_date = ? ORDER BY id',
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /work-orders', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { plan_date, batch_id, line_id, shift, product_id, grade_pack_id, planned_qty, actual_qty, wastage_qty, status } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO work_orders (plan_date, batch_id, line_id, shift, product_id, grade_pack_id, planned_qty, actual_qty, wastage_qty, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [plan_date, batch_id || null, line_id, shift, product_id, grade_pack_id, planned_qty, actual_qty || 0, wastage_qty || 0, status || 'open']
    );
    
    res.json({ message: 'Work order created', id: result.insertId });
  } catch (err) {
    console.error('POST /work-orders', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateActuals = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_qty, wastage_qty, status } = req.body;
    
    await db.query(
      'UPDATE work_orders SET actual_qty = ?, wastage_qty = ?, status = ? WHERE id = ?',
      [actual_qty, wastage_qty, status, id]
    );
    
    res.json({ message: 'Work order updated' });
  } catch (err) {
    console.error('PUT /work-orders/:id/actuals', err);
    res.status(500).json({ error: 'Server error' });
  }
};