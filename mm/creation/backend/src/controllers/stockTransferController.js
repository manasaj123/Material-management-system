import db from "../config/db.js";

export const createStockTransfer = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { header, items } = req.body;
    // header: { from_location_id, to_location_id, transfer_date, ref_no }
    await conn.beginTransaction();

    for (const item of items || []) {
      const qty = Number(item.qty) || 0;
      if (!qty) continue;

      // 1) OUT from source location
      // OUT
await conn.query(
  `INSERT INTO stock_ledger
   (material_id, location_id, batch_id, txn_type, qty_in, qty_out,
    unit_cost, txn_ref_type, txn_ref_id, txn_date)
   VALUES (?, ?, ?, 'TRANSFER_OUT', 0, ?, ?, ?, ?, ?)`,
  [
    item.material_id,
    header.from_location_id,
    item.batch_id || null,
    qty,
    item.unit_cost || 0,
    // put full reference text here, or keep 'STOCK_TRANSFER'
    header.ref_no || "STOCK_TRANSFER",
    // keep txn_ref_id numeric or null
    null,
    header.transfer_date
  ]
);

// IN
await conn.query(
  `INSERT INTO stock_ledger
   (material_id, location_id, batch_id, txn_type, qty_in, qty_out,
    unit_cost, txn_ref_type, txn_ref_id, txn_date)
   VALUES (?, ?, ?, 'TRANSFER_IN', ?, 0, ?, ?, ?, ?)`,
  [
    item.material_id,
    header.to_location_id,
    item.batch_id || null,
    qty,
    item.unit_cost || 0,
    header.ref_no || "STOCK_TRANSFER",
    null,
    header.transfer_date
  ]
);

    }

    await conn.commit();
    res.status(201).json({ success: true });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};