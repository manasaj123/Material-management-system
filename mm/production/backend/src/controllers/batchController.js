const db = require('../config/db');

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM process_batches WHERE plan_date = ? ORDER BY id',
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /batch', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createMany = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { date, rows } = req.body;
    
    await connection.beginTransaction();
    
    // Delete existing batches for this date
    await connection.query('DELETE FROM process_batches WHERE plan_date = ?', [date]);
    
    // Insert new batch rows
    if (rows && rows.length > 0) {
      for (const row of rows) {
        await connection.query(
          'INSERT INTO process_batches (plan_date, product_id, grade_pack_id, batch_size, line_id, shift) VALUES (?, ?, ?, ?, ?, ?)',
          [date, row.product_id, row.grade_pack_id, row.batch_size, row.line_id, row.shift]
        );
      }
    }
    
    await connection.commit();
    res.json({ message: 'Batches created', count: rows.length });
  } catch (err) {
    await connection.rollback();
    console.error('POST /batch', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
};