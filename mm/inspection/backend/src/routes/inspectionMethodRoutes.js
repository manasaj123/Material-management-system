// routes/inspectionMethodRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // your mysql pool/connection

// GET active inspection methods (not deleted)
router.get("/inspection-methods", (req, res) => {
  const { status } = req.query; // optional filter: RELEASED / NOT_RELEASED / PROCESS

  let sql = "SELECT * FROM inspection_methods WHERE is_deleted = 0";
  const params = [];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(rows);
  });
});

// GET recycle bin items (deleted = true)
router.get("/inspection-methods/recycle-bin", (req, res) => {
  const sql = "SELECT * FROM inspection_methods WHERE is_deleted = 1";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(rows);
  });
});

// CREATE
// routes/inspectionMethodRoutes.js  (CREATE route)
router.post("/inspection-methods", (req, res) => {
  const { masterInspectionId, inspectionName, status } = req.body;

  const sql =
    "INSERT INTO inspection_methods (master_inspection_id, inspection_name, status) VALUES (?, ?, ?)";
  db.query(
    sql,
    [masterInspectionId || null, inspectionName, status],
    (err, result) => {
      if (err) {
        console.error("INSERT inspection_methods error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      const selectSql = "SELECT * FROM inspection_methods WHERE id = ?";
      db.query(selectSql, [result.insertId], (err2, rows) => {
        if (err2) {
          console.error("SELECT inspection_methods after insert error:", err2);
          return res.status(500).json({ message: "DB error", error: err2 });
        }
        res.status(201).json(rows[0]);
      });
    }
  );
});


// UPDATE
router.put("/inspection-methods/:id", (req, res) => {
  const id = Number(req.params.id);
  const { masterInspectionId, inspectionName, status } = req.body;

  const sql =
    "UPDATE inspection_methods SET master_inspection_id = ?, inspection_name = ?, status = ? WHERE id = ? AND is_deleted = 0";
  db.query(
    sql,
    [masterInspectionId || null, inspectionName, status, id],
    (err, result) => {
      if (err) {
        console.error("UPDATE inspection_methods error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Not found or already deleted" });
      }

      const selectSql = "SELECT * FROM inspection_methods WHERE id = ?";
      db.query(selectSql, [id], (err2, rows) => {
        if (err2) {
          console.error(
            "SELECT inspection_methods after update error:",
            err2
          );
          return res.status(500).json({ message: "DB error", error: err2 });
        }
        res.json(rows[0]);
      });
    }
  );
});


// SOFT DELETE -> move to recycle bin
router.delete("/inspection-methods/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "UPDATE inspection_methods SET is_deleted = 1, deleted_at = NOW() WHERE id = ? AND is_deleted = 0";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Not found or already deleted" });

    res.json({ message: "Moved to recycle bin" });
  });
});

// RESTORE from recycle bin
router.post("/inspection-methods/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "UPDATE inspection_methods SET is_deleted = 0, deleted_at = NULL WHERE id = ? AND is_deleted = 1";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Not found or not in bin" });

    const selectSql = "SELECT * FROM inspection_methods WHERE id = ?";
    db.query(selectSql, [id], (err2, rows) => {
      if (err2) return res.status(500).json({ message: "DB error", error: err2 });
      res.json(rows[0]);
    });
  });
});

// HARD DELETE from recycle bin
router.delete("/inspection-methods/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql = "DELETE FROM inspection_methods WHERE id = ? AND is_deleted = 1";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Not found or not in bin" });

    res.json({ message: "Permanently deleted" });
  });
});

module.exports = router;
