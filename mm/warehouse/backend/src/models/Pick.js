
const db = require('../config/db');

module.exports = {
  create: async (data) => {
    const [result] = await db.execute(
      `INSERT INTO picks (pick_no, order_id, item_id, qty_picked, bin_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.pick_no, data.order_id, data.item_id, data.qty_picked, data.bin_id, 'pending']
    );
    return result.insertId;
  },
  
  getPending: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, 
               COALESCE(i.name, 'Unknown') as item_name, 
               COALESCE(b.bin_code, 'Unknown') as bin_code
        FROM picks p 
        LEFT JOIN items i ON p.item_id = i.id 
        LEFT JOIN bins b ON p.bin_id = b.id 
        WHERE p.status = 'pending'
        ORDER BY COALESCE(p.created_at, p.id) DESC
      `);
      return rows;
    } catch (error) {
      console.error('Pick.getPending error:', error.message);
      return [];
    }
  },

  updateStatus: async (id, status) => {
    const [result] = await db.execute(
      'UPDATE picks SET status = ?, picked_at = NOW() WHERE id = ?', 
      [status, id]
    );
    return result.affectedRows;
  }
};
