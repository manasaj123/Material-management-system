const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * Helper: smart bin selection (least‑filled first)
 */
function findBestBin(bins, qty) {
  const suitable = bins.filter(
    (bin) => bin.capacity - bin.current_usage >= qty,
  );
  if (suitable.length === 0) return null;
  suitable.sort((a, b) => a.current_usage - b.current_usage);
  return suitable[0];
}

/* ==========================================
   GET PENDING GRNs (with QC summary)
   ========================================== */
router.get("/pending", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT g.id, g.grn_no, g.warehouse_id, g.po_id, g.received_date,
              g.total_items, g.status,
              po.po_no AS po_no,
              COUNT(gi.id) AS item_count,
              SUM(CASE WHEN gi.qc_status = 'accepted' THEN 1 ELSE 0 END) AS accepted_count,
              SUM(CASE WHEN gi.qc_status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count
       FROM grn g
       LEFT JOIN creation1_db.purchase_orders po ON g.po_id = po.id
       LEFT JOIN grn_items gi ON gi.grn_id = g.id
       WHERE g.status = 'pending'
       GROUP BY g.id
       ORDER BY g.received_date DESC`,
    );
    res.json(rows);
  } catch (err) {
    console.error("GRN pending error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   GET OPEN PURCHASE ORDERS (from MM Creation)
   ========================================== */
router.get("/purchase-orders", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, po_no, po_date, vendor_id, status
       FROM creation1_db.purchase_orders
       WHERE status = 'OPEN'
       ORDER BY po_date DESC`,
    );
    res.json(rows);
  } catch (err) {
    console.error("PO list error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   GET PO ITEMS (via Integration Hub mapping)
   ========================================== */
router.get("/po/:poId/items", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         pi.id,
         pi.batch_no,
         pi.qty,
         pi.expiry_date,
         m.part_name AS material_name,
         m.part_number,
         m.uom,
         m.shelf_life_days,
         COALESCE(map.warehouse_id, 0) AS material_id
       FROM creation1_db.po_items pi
       JOIN creation1_db.materials m ON pi.material_id = m.id
       LEFT JOIN integration_hub.material_mapping map 
              ON map.mm_creation_id = m.id
       WHERE pi.po_id = ?`,
      [req.params.poId],
    );
    res.json(rows);
  } catch (err) {
    console.error("PO items error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   GET GRN ITEMS (for QC modal)
   ========================================== */
router.get("/:id/items", async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT gi.*, i.name AS part_name, i.sku AS part_number, i.unit AS uom
       FROM grn_items gi
       JOIN items i ON gi.item_id = i.id
       WHERE gi.grn_id = ?`,
      [req.params.id],
    );
    res.json(items);
  } catch (err) {
    console.error("GRN items error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   CREATE GRN
   ========================================== */
router.post("/", async (req, res) => {
  const { grn_no, warehouse_id, received_date, po_id, items } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const totalItems = items.reduce((sum, i) => sum + i.qty_received, 0);
    const [grnResult] = await connection.query(
      `INSERT INTO grn (grn_no, warehouse_id, po_id, received_date, total_items, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [grn_no, warehouse_id, po_id || null, received_date, totalItems],
    );
    const grnId = grnResult.insertId;

    for (const item of items) {
      await connection.query(
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

    await connection.commit();
    res.status(201).json({ id: grnId });
  } catch (err) {
    await connection.rollback();
    console.error("GRN create error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/* ==========================================
   QC – save acceptance/rejection decisions
   ========================================== */
router.put("/:id/qc", async (req, res) => {
  const { grnId, items } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of items) {
      // Fetch the original qty_received
      const [[original]] = await connection.query(
        "SELECT qty_received FROM grn_items WHERE id = ?",
        [item.id],
      );

      if (!original) {
        throw new Error(`GRN item ${item.id} not found`);
      }

      const qtyReceived = Number(original.qty_received);
      const acceptedQty = Number(item.accepted_qty) || 0;
      const rejectedQty = Number(item.rejected_qty) || 0;

      // Validate: accepted + rejected = qty_received
      if (item.qc_status === "accepted" || item.qc_status === "rejected") {
        if (acceptedQty + rejectedQty !== qtyReceived) {
          await connection.rollback();
          return res.status(400).json({
            error: `Item ${item.id}: Accepted (${acceptedQty}) + Rejected (${rejectedQty}) must equal Received Qty (${qtyReceived})`,
          });
        }
      }

      await connection.query(
        `UPDATE grn_items
         SET qc_status = ?, accepted_qty = ?, rejected_qty = ?, qc_remarks = ?, qc_date = NOW()
         WHERE id = ?`,
        [
          item.qc_status,
          acceptedQty,
          rejectedQty,
          item.qc_remarks || null,
          item.id,
        ],
      );
    }

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error("QC error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/* ==========================================
   PUTAWAY – only accepted items, smart bin allocation
   ========================================== */
router.put("/:id/putaway", async (req, res) => {
  const grnId = req.params.id;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [[grn]] = await connection.query("SELECT * FROM grn WHERE id = ?", [
      grnId,
    ]);
    if (!grn) {
      await connection.rollback();
      return res.status(404).json({ error: "GRN not found" });
    }

    const [items] = await connection.query(
      "SELECT * FROM grn_items WHERE grn_id = ? AND qc_status = 'accepted'",
      [grnId],
    );
    if (!items.length) {
      await connection.rollback();
      return res.status(400).json({ error: "No accepted items to put away" });
    }

    const [bins] = await connection.query(
      "SELECT * FROM bins WHERE warehouse_id = ? ORDER BY current_usage ASC",
      [grn.warehouse_id],
    );
    if (!bins.length) {
      await connection.rollback();
      return res.status(400).json({ error: "No bins in warehouse" });
    }

    for (const item of items) {
      const qtyToStore = item.accepted_qty ?? item.qty_received;
      const bin = findBestBin(bins, qtyToStore);
      if (!bin) {
        throw new Error(
          `Not enough space in any bin for item ${item.item_id} (need ${qtyToStore})`,
        );
      }

      await connection.query(
        `INSERT INTO inventory (item_id, bin_id, qty, batch_no, expiry_date)
         VALUES (?, ?, ?, ?, ?)`,
        [item.item_id, bin.id, qtyToStore, item.batch_no, item.expiry_date],
      );

      await connection.query(
        `UPDATE bins SET current_usage = current_usage + ? WHERE id = ?`,
        [qtyToStore, bin.id],
      );

      await connection.query(
        `UPDATE grn_items SET assigned_bin_id = ?, putaway_time = NOW() WHERE id = ?`,
        [bin.id, item.id],
      );

      bin.current_usage += qtyToStore;
    }

    await connection.query(
      `UPDATE grn SET status = 'complete', putaway_date = NOW() WHERE id = ?`,
      [grnId],
    );

    await connection.commit();

    // Optional: stock sync webhook can be added here if needed

    res.json({ message: "Putaway completed successfully", grn_id: grnId });
  } catch (err) {
    await connection.rollback();
    console.error("PUTAWAY ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
