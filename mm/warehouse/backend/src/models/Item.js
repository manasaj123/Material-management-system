const db = require('../config/db');

module.exports = {
  create: async (data) => {
    const [result] = await db.execute(
      'INSERT INTO items (sku, name, unit, expiry_days) VALUES (?, ?, ?, ?)',
      [data.sku, data.name, data.unit, data.expiry_days]
    );
    return result.insertId;
  },
  findAll: async () => db.execute('SELECT * FROM items'),
  findById: async (id) => db.execute('SELECT * FROM items WHERE id = ?', [id])
};
