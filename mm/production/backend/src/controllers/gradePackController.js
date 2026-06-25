const db = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM grade_packs ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};