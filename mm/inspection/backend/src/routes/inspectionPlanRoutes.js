// routes/inspectionPlanRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // mysql2 pool

// GET active inspection plans
router.get("/inspection-plans", (req, res) => {
  const sql =
    "SELECT * FROM inspection_plans WHERE is_deleted = 0 ORDER BY id DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET inspection_plans error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }
    res.json(rows);
  });
});

// GET recycle bin
router.get("/inspection-plans/recycle-bin", (req, res) => {
  const sql =
    "SELECT * FROM inspection_plans WHERE is_deleted = 1 ORDER BY deleted_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET inspection_plans recycle-bin error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }
    res.json(rows);
  });
});

// CREATE
router.post("/inspection-plans", (req, res) => {
  const {
    materialCode,
    plantCode,
    groupCode,
    vendorCode,
    validFrom,
    deletionFlag,
    usageCode,
    statusCode,
    planningGroup,
    fromLotSize,
    toLotSize
  } = req.body;

  const sql = `
    INSERT INTO inspection_plans
      (material_code, plant_code, group_code, vendor_code,
       valid_from, deletion_flag, usage_code, status_code,
       planning_group, from_lot_size, to_lot_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    materialCode,
    plantCode,
    groupCode || null,
    vendorCode || null,
    validFrom,
    deletionFlag != null ? Number(deletionFlag) : 0,
    usageCode,
    statusCode,
    planningGroup || null,
    fromLotSize != null && fromLotSize !== "" ? Number(fromLotSize) : null,
    toLotSize != null && toLotSize !== "" ? Number(toLotSize) : null
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("INSERT inspection_plans error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    db.query(
      "SELECT * FROM inspection_plans WHERE id = ?",
      [result.insertId],
      (err2, rows) => {
        if (err2) {
          console.error(
            "SELECT inspection_plans after insert error:",
            err2
          );
          return res
            .status(500)
            .json({ message: "DB error", error: err2 });
        }
        res.status(201).json(rows[0]);
      }
    );
  });
});

// UPDATE
router.put("/inspection-plans/:id", (req, res) => {
  const id = Number(req.params.id);
  const {
    materialCode,
    plantCode,
    groupCode,
    vendorCode,
    validFrom,
    deletionFlag,
    usageCode,
    statusCode,
    planningGroup,
    fromLotSize,
    toLotSize
  } = req.body;

  const sql = `
    UPDATE inspection_plans
    SET material_code = ?, plant_code = ?, group_code = ?, vendor_code = ?,
        valid_from = ?, deletion_flag = ?, usage_code = ?, status_code = ?,
        planning_group = ?, from_lot_size = ?, to_lot_size = ?
    WHERE id = ? AND is_deleted = 0
  `;

  const params = [
    materialCode,
    plantCode,
    groupCode || null,
    vendorCode || null,
    validFrom,
    deletionFlag != null ? Number(deletionFlag) : 0,
    usageCode,
    statusCode,
    planningGroup || null,
    fromLotSize != null && fromLotSize !== "" ? Number(fromLotSize) : null,
    toLotSize != null && toLotSize !== "" ? Number(toLotSize) : null,
    id
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("UPDATE inspection_plans error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Not found or already deleted" });
    }

    db.query(
      "SELECT * FROM inspection_plans WHERE id = ?",
      [id],
      (err2, rows) => {
        if (err2) {
          console.error(
            "SELECT inspection_plans after update error:",
            err2
          );
          return res
            .status(500)
            .json({ message: "DB error", error: err2 });
        }
        res.json(rows[0]);
      }
    );
  });
});

// SOFT DELETE
router.delete("/inspection-plans/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE inspection_plans
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("SOFT DELETE inspection_plans error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Not found or already deleted" });
    }

    res.json({ message: "Moved to recycle bin" });
  });
});

// RESTORE
router.post("/inspection-plans/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE inspection_plans
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ? AND is_deleted = 1
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("RESTORE inspection_plans error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Not found or not in recycle bin" });
    }

    db.query(
      "SELECT * FROM inspection_plans WHERE id = ?",
      [id],
      (err2, rows) => {
        if (err2) {
          console.error(
            "SELECT inspection_plans after restore error:",
            err2
          );
          return res
            .status(500)
            .json({ message: "DB error", error: err2 });
        }
        res.json(rows[0]);
      }
    );
  });
});

// HARD DELETE
router.delete("/inspection-plans/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "DELETE FROM inspection_plans WHERE id = ? AND is_deleted = 1";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("HARD DELETE inspection_plans error:", err);
      return res
        .status(500)
        .json({ message: "DB error", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Not found or not in recycle bin" });
    }

    res.json({ message: "Permanently deleted" });
  });
});

module.exports = router;