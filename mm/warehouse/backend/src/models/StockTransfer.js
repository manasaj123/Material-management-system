const db = require('../config/db');

module.exports = {
  create: async (data) => {
    const [result] = await db.execute(
      'INSERT INTO stock_transfers (transfer_no, from_bin_id, to_bin_id, item_id, qty, status) VALUES (?, ?, ?, ?, ?, ?)',
      [data.transfer_no, data.from_bin_id, data.to_bin_id, data.item_id, data.qty, 'pending']
    );
    return result.insertId;
  },
  complete: async (id) => 
    db.execute('UPDATE stock_transfers SET status = "completed" WHERE id = ?', [id])
};
