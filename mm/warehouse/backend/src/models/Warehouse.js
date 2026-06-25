const db = require('../config/db');

module.exports = {
  create: async (data) => {
    const [result] = await db.execute(
      'INSERT INTO warehouses (name, layout_json) VALUES (?, ?)',
      [data.name, JSON.stringify(data.layout)]
    );
    return result.insertId;
  },
  findAll: async () => db.execute('SELECT * FROM warehouses'),
  findById: async (id) => db.execute('SELECT * FROM warehouses WHERE id = ?', [id])
};
  