const Grn = require("../models/Grn");
const db = require("../config/db");
const axios = require("axios");
const INTEGRATION_HUB = "http://localhost:3000";

// Helper: smart bin selection (least-filled first)
function findBestBin(bins, qty) {
  const suitable = bins.filter(
    (bin) => bin.capacity - bin.current_usage >= qty,
  );
  if (suitable.length === 0) return null;
  suitable.sort((a, b) => a.current_usage - b.current_usage);
  return suitable[0];
}

exports.createGRN = async (req, res) => {
  try {
    const id = await Grn.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    console.error("CREATE GRN ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPending = async (req, res) => {
  try {
    const [grns] = await Grn.findPending();
    res.json(grns);
  } catch (error) {
    console.error("GET GRN ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// Return PO items for GRN form auto‑fill
exports.getPOItems = async (req, res) => {
  try {
    const [items] = await Grn.getPOItems(req.params.poId);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Return GRN items for QC modal
exports.getGRNItems = async (req, res) => {
  try {
    const [items] = await Grn.findItems(req.params.id);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Save QC decisions for a GRN
exports.qcGRN = async (req, res) => {
  const { grnId, items } = req.body; // items: [{ id, qc_status, accepted_qty, rejected_qty, qc_remarks }]
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const item of items) {
      await conn.query(
        `UPDATE grn_items
         SET qc_status = ?, accepted_qty = ?, rejected_qty = ?, qc_remarks = ?, qc_date = NOW()
         WHERE id = ?`,
        [
          item.qc_status,
          item.accepted_qty || null,
          item.rejected_qty || null,
          item.qc_remarks || null,
          item.id,
        ],
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

exports.putAwayGRN = async (req, res) => {
  const grnId = req.params.id;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Get ONLY accepted GRN items
    const [items] = await conn.query(
      "SELECT * FROM grn_items WHERE grn_id = ? AND qc_status = 'accepted'",
      [grnId],
    );

    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: "No accepted items to put away" });
    }

    // 2. GRN + warehouse
    const [[grn]] = await conn.query("SELECT * FROM grn WHERE id = ?", [grnId]);
    const warehouseId = grn.warehouse_id;

    // 3. Bins – sorted by least filled (smart allocation)
    const [bins] = await conn.query(
      "SELECT * FROM bins WHERE warehouse_id = ? ORDER BY current_usage ASC",
      [warehouseId],
    );
    if (!bins.length) throw new Error("No bins available");

    // 4. Process each accepted item
    for (const item of items) {
      const qtyToStore = item.accepted_qty ?? item.qty_received;
      const bin = findBestBin(bins, qtyToStore);
      if (!bin) {
        throw new Error(`No bin with enough space for item ${item.item_id}`);
      }

      // Insert inventory with batch and expiry
      await conn.query(
        `INSERT INTO inventory (item_id, bin_id, qty, batch_no, expiry_date)
         VALUES (?, ?, ?, ?, ?)`,
        [item.item_id, bin.id, qtyToStore, item.batch_no, item.expiry_date],
      );

      // Update bin usage
      await conn.query(
        `UPDATE bins SET current_usage = current_usage + ? WHERE id = ?`,
        [qtyToStore, bin.id],
      );

      // Update grn_item as putaway
      await conn.query(
        `UPDATE grn_items SET assigned_bin_id = ?, putaway_time = NOW() WHERE id = ?`,
        [bin.id, item.id],
      );

      // Reflect the added usage locally so next item sees updated capacity
      bin.current_usage += qtyToStore;
    }

    // 5. Mark GRN as complete
    await conn.query(
      `UPDATE grn SET status = 'complete', putaway_date = NOW() WHERE id = ?`,
      [grnId],
    );

    await conn.commit();

    // ============================================
    // STOCK SYNC AFTER PUTAWAY (unchanged)
    // ============================================
    try {
      const [syncedItems] = await conn.query(
        `SELECT i.part_number AS sku, COALESCE(SUM(inv.qty), 0) AS total_qty
         FROM grn_items gi
         JOIN items i ON gi.item_id = i.id
         LEFT JOIN inventory inv ON inv.item_id = i.id
         WHERE gi.grn_id = ?
         GROUP BY i.part_number`,
        [grnId],
      );

      for (const item of syncedItems) {
        await axios.post(`${INTEGRATION_HUB}/api/stock/sync`, {
          material_code: item.sku,
          quantity: Number(item.total_qty),
          module: "warehouse",
        });
        console.log(`✅ Stock sync: ${item.sku} → ${item.total_qty}`);
      }
    } catch (err) {
      console.error("Stock sync webhook failed:", err.message);
    }

    res.json({ message: "Put away completed successfully" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
};
