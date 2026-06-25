const db = require('../config/db');

module.exports = {
  create: async (data) => {
    const [result] = await db.execute(
      'INSERT INTO bins (warehouse_id, bin_code, capacity, zone) VALUES (?, ?, ?, ?)',
      [data.warehouse_id, data.bin_code, data.capacity, data.zone]
    );
    return result.insertId;
  },
  findByWarehouse: async (warehouseId) => 
    db.execute('SELECT * FROM bins WHERE warehouse_id = ?', [warehouseId]),
  updateUsage: async (binId, usage) =>
    db.execute('UPDATE bins SET current_usage = ? WHERE id = ?', [usage, binId])
};
