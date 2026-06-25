const db = require('../config/db');

module.exports = {
  create: async (data) => {
    const [result] = await db.execute(
      'INSERT INTO dispatches (dispatch_no, pick_id, status) VALUES (?, ?, ?)',
      [data.dispatch_no, data.pick_id, 'ready']
    );
    return result.insertId;
  },
  getReady: async () => db.execute('SELECT * FROM dispatches WHERE status = "ready"'),
  markDispatched: async (id) => 
    db.execute('UPDATE dispatches SET status = "dispatched", dispatched_at = NOW() WHERE id = ?', [id])
};
