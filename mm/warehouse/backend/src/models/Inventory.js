const db = require('../config/db');

module.exports = {
  create: async (data) => {
    const [result] = await db.execute(
      'INSERT INTO inventory (item_id, bin_id, qty, batch_no, expiry_date) VALUES (?, ?, ?, ?, ?)',
      [data.item_id, data.bin_id, data.qty, data.batch_no, data.expiry_date]
    );
    return result.insertId;
  },
  getFIFO: async (itemId, qty) => {
    return db.execute(`
      SELECT * FROM inventory 
      WHERE item_id = ? AND qty > 0 
      ORDER BY expiry_date ASC 
      LIMIT ?`, [itemId, qty]);
  },
  updateQty: async (id, newQty) =>
    db.execute('UPDATE inventory SET qty = ? WHERE id = ?', [newQty, id])
};
