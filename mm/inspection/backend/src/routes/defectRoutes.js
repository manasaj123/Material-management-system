// inspection/backend/src/routes/defectRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* GET active defects */
router.get("/defects", (req, res) => {
  const sql = "SELECT * FROM defects WHERE is_deleted = 0 ORDER BY id DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET defects error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      defectType: r.defect_type,      // CUSTOMER / VENDOR / INTERNAL
      title: r.title,
      description: r.description,
      materialCode: r.material_code,
      lotOrOrderNo: r.lot_or_order_no,
      reporter: r.reporter,
      priority: r.priority,
      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

/* GET recycle bin */
router.get("/defects/recycle-bin", (req, res) => {
  const sql =
    "SELECT * FROM defects WHERE is_deleted = 1 ORDER BY deleted_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET defects recycle-bin error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      defectType: r.defect_type,
      title: r.title,
      description: r.description,
      materialCode: r.material_code,
      lotOrOrderNo: r.lot_or_order_no,
      reporter: r.reporter,
      priority: r.priority,
      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

/* CREATE defect */
router.post("/defects", (req, res) => {
  const {
    defectType,     // CUSTOMER / VENDOR / INTERNAL
    title,
    description,
    materialCode,
    lotOrOrderNo,
    reporter,
    priority        // LOW / MEDIUM / HIGH
  } = req.body;

  const sql = `
    INSERT INTO defects
      (defect_type, title, description,
       material_code, lot_or_order_no, reporter, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      defectType || "INTERNAL",
      title || "",
      description || null,
      materialCode || null,
      lotOrOrderNo || null,
      reporter || null,
      priority || "MEDIUM"
    ],
    (err) => {
      if (err) {
        console.error("INSERT defects error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      res.status(201).json({ message: "Defect recorded" });
    }
  );
});

/* UPDATE defect */
router.put("/defects/:id", (req, res) => {
  const id = Number(req.params.id);
  const {
    defectType,
    title,
    description,
    materialCode,
    lotOrOrderNo,
    reporter,
    priority
  } = req.body;

  const sql = `
    UPDATE defects
    SET defect_type = ?,
        title = ?,
        description = ?,
        material_code = ?,
        lot_or_order_no = ?,
        reporter = ?,
        priority = ?
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(
    sql,
    [
      defectType || "INTERNAL",
      title || "",
      description || null,
      materialCode || null,
      lotOrOrderNo || null,
      reporter || null,
      priority || "MEDIUM",
      id
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE defects error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json({ message: "Defect updated" });
    }
  );
});

/* SOFT DELETE */
router.delete("/defects/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE defects
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("SOFT DELETE defects error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Moved to recycle bin" });
  });
});

/* RESTORE */
router.post("/defects/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE defects
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ? AND is_deleted = 1
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("RESTORE defects error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Restored successfully" });
  });
});

/* HARD DELETE */
router.delete("/defects/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql = "DELETE FROM defects WHERE id = ? AND is_deleted = 1";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("HARD DELETE defects error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Permanently deleted" });
  });
});

module.exports = router;
