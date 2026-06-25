const db = require("../config/db");

module.exports = {
  create: async (data) => {
    const { grn_no, warehouse_id, received_date, total_items } = data;

    const [result] = await db.query(
      `INSERT INTO grns 
       (grn_no, warehouse_id, received_date, total_items, status)
       VALUES (?, ?, ?, ?, 'PENDING')`,
      [grn_no, warehouse_id, received_date, total_items]
    );

    return result.insertId;
  },

  findPending: async () => {
    return db.query(
      "SELECT * FROM grns WHERE status = 'PENDING'"
    );
  }
};
