const db = require('../config/db'); 

module.exports = {
  getAll: async (req, res) => {
    try {
      const [warehouses] = await db.execute('SELECT * FROM warehouses');
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  create: async (req, res) => {
    try {
      const [result] = await db.execute(
        'INSERT INTO warehouses (name) VALUES (?)', [req.body.name]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
