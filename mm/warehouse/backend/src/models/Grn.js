const db = require("../config/db");

module.exports = {
  /**
   * Create GRN with items (batch, expiry, QC defaults)
   */
  create: async (data) => {
    const { grn_no, warehouse_id, received_date, po_id, items } = data;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const totalItems = items.reduce((sum, i) => sum + i.qty_received, 0);
      const [grnRes] = await conn.query(
        `INSERT INTO grn (grn_no, warehouse_id, po_id, received_date, total_items, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [grn_no, warehouse_id, po_id || null, received_date, totalItems],
      );
      const grnId = grnRes.insertId;

      for (const item of items) {
        await conn.query(
          `INSERT INTO grn_items (grn_id, item_id, batch_no, expiry_date, qty_received, qc_status)
           VALUES (?, ?, ?, ?, ?, 'pending')`,
          [
            grnId,
            item.item_id,
            item.batch_no || null,
            item.expiry_date || null,
            item.qty_received,
          ],
        );
      }

      await conn.commit();
      return grnId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Pending GRNs with QC summary
   */
  findPending: async () => {
    return db.query(
      `SELECT g.id, g.grn_no, g.warehouse_id, g.po_id, g.received_date,
              g.total_items, g.status,
              po.po_no AS po_no,
              COUNT(gi.id) AS item_count,
              SUM(CASE WHEN gi.qc_status = 'accepted' THEN 1 ELSE 0 END) AS accepted_count,
              SUM(CASE WHEN gi.qc_status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count
       FROM grn g
       LEFT JOIN purchase_orders po ON g.po_id = po.id
       LEFT JOIN grn_items gi ON gi.grn_id = g.id
       WHERE g.status = 'pending'
       GROUP BY g.id
       ORDER BY g.received_date DESC`,
    );
  },

  /**
   * Get one GRN header
   */
  findById: async (id) => {
    return db.query(`SELECT * FROM grn WHERE id = ?`, [id]);
  },

  /**
   * Get all items of a GRN (for QC modal)
   */
  findItems: async (grnId) => {
    return db.query(
      `SELECT gi.*, i.part_name, i.part_number, i.uom, i.shelf_life_days
       FROM grn_items gi
       JOIN items i ON gi.item_id = i.id
       WHERE gi.grn_id = ?`,
      [grnId],
    );
  },

  /**
   * Fetch PO items (for auto‑fill in GRN form)
   */
  getPOItems: async (poId) => {
    return db.query(
      `SELECT pi.id, pi.material_id, pi.batch_no, pi.qty, pi.expiry_date,
              m.part_name, m.part_number, m.uom, m.shelf_life_days
       FROM po_items pi
       JOIN materials m ON pi.material_id = m.id
       WHERE pi.po_id = ?`,
      [poId],
    );
  },
};
