const db = require("../config/db");

/* ================= CREATE LOT ================= */
exports.createLot = (req, res) => {
  const { lot_number, product_name, quantity, unit } = req.body;

  if (!lot_number || !product_name || !quantity || !unit) {
    return res.status(400).json({
      message: "lot_number, product_name, quantity and unit are required",
    });
  }

  const sql = `
    INSERT INTO lots
      (lot_number, product_name, quantity, unit, status)
    VALUES (?, ?, ?, ?, 'PENDING')
  `;

  db.query(
    sql,
    [
      lot_number.trim(),
      product_name.trim(),
      Number(quantity),
      unit.trim(),
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Create lot error:", err);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Lot created successfully",
        id: result.insertId,
      });
    }
  );
};

/* ================= GET LOTS ================= */
exports.getLots = (req, res) => {
  db.query(
    "SELECT * FROM lots ORDER BY created_at DESC",
    (err, results) => {
      if (err) {
        console.error("❌ Get lots error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};

/* ================= UPDATE STATUS + AUDIT ================= */
exports.updateLotStatus = (req, res) => {
  const { id } = req.params;
  const { status, findings } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  db.query(
    "UPDATE lots SET status=? WHERE id=?",
    [status, id],
    err => {
      if (err) {
        console.error("❌ Status update error:", err);
        return res.status(500).json({ error: err.message });
      }

      db.query(
        "INSERT INTO qc_reports (lot_id, findings, decision) VALUES (?, ?, ?)",
        [id, findings || "-", status],
        err2 => {
          if (err2) {
            console.error("❌ Audit insert error:", err2);
            return res.status(500).json({ error: err2.message });
          }

          res.json({ message: "Lot status updated successfully" });
        }
      );
    }
  );
};