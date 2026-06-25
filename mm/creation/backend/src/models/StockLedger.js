import db from "../config/db.js";

export const StockLedger = {
  insertEntry(entry) {
    const {
      material_id,
      location_id,
      batch_id,
      txn_type,
      qty_in,
      qty_out,
      unit_cost,
      txn_ref_type,
      txn_ref_id,
      txn_date
    } = entry;

    return db.query(
      `INSERT INTO stock_ledger
       (material_id, location_id, batch_id, txn_type, qty_in, qty_out,
        unit_cost, txn_ref_type, txn_ref_id, txn_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        material_id,
        location_id,
        batch_id,
        txn_type,
        qty_in,
        qty_out,
        unit_cost,
        txn_ref_type,
        txn_ref_id,
        txn_date
      ]
    );
  },

  // batch-level summary with perishable flag
  getStockSummary() {
    return db.query(
      `SELECT 
          sl.material_id,
          sl.location_id,
          sl.batch_id,
          b.expiry_date,
          m.perishable,
          SUM(sl.qty_in - sl.qty_out) AS qty
       FROM stock_ledger sl
       LEFT JOIN batches b ON b.id = sl.batch_id
       LEFT JOIN materials m ON m.id = sl.material_id
       GROUP BY sl.material_id, sl.location_id, sl.batch_id, b.expiry_date, m.perishable
       HAVING qty <> 0
       ORDER BY sl.material_id, sl.location_id, sl.batch_id`
    );
  }
};
