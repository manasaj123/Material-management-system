// routes/resultRecordingUsageDecisionRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // mysql2 pool

const mapRow = r => ({
  id: r.id,
  plantCode: r.plant_code,
  origin: r.origin,
  materialCode: r.material_code,
  batchNumber: r.batch_number,
  vendorCode: r.vendor_code,
  resultText: r.result_summary,
  usageDecision: r.usage_decision,      // UD code, e.g. 'A'
  qualityScore: r.quality_score,        // 100 when UD = 'A'
  isDeleted: !!r.is_deleted,
  deletedAt: r.deleted_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

// Common validators
const codeRegex = /^[A-Z0-9_-]+$/;   // plant/material/batch/vendor
const udRegex = /^[A-Z]$/;           // single letter

function validatePayload(req, res) {
  const {
    plantCode,
    origin,
    materialCode,
    batchNumber,
    vendorCode,
    usageDecision
  } = req.body;

  if (!plantCode || !materialCode || !batchNumber || !vendorCode) {
    res.status(400).json({
      message:
        "plantCode, materialCode, batchNumber, vendorCode are required"
    });
    return null;
  }

  if (!codeRegex.test(plantCode.toUpperCase())) {
    res.status(400).json({ message: "Invalid plantCode" });
    return null;
  }
  if (!codeRegex.test(materialCode.toUpperCase())) {
    res.status(400).json({ message: "Invalid materialCode" });
    return null;
  }
  if (!codeRegex.test(batchNumber.toUpperCase())) {
    res.status(400).json({ message: "Invalid batchNumber" });
    return null;
  }
  if (!codeRegex.test(vendorCode.toUpperCase())) {
    res.status(400).json({ message: "Invalid vendorCode" });
    return null;
  }

  const originVal = origin || "01";

  if (usageDecision && !udRegex.test(usageDecision.toUpperCase())) {
    res.status(400).json({ message: "Invalid usageDecision (must be one letter A–Z)" });
    return null;
  }

  return {
    plantCode: plantCode.toUpperCase(),
    origin: originVal,
    materialCode: materialCode.toUpperCase(),
    batchNumber: batchNumber.toUpperCase(),
    vendorCode: vendorCode.toUpperCase(),
    usageDecision: usageDecision ? usageDecision.toUpperCase() : ""
  };
}

// GET active
router.get("/raw-material-inspections", (req, res) => {
  const sql =
    "SELECT * FROM raw_material_inspections WHERE is_deleted = 0 ORDER BY id DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET raw_material_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }
    res.json(rows.map(mapRow));
  });
});

// GET recycle bin
router.get("/raw-material-inspections/recycle-bin", (req, res) => {
  const sql =
    "SELECT * FROM raw_material_inspections WHERE is_deleted = 1 ORDER BY deleted_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET raw_material_inspections recycle-bin error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }
    res.json(rows.map(mapRow));
  });
});

// CREATE (insert)
router.post("/raw-material-inspections", (req, res) => {
  const base = validatePayload(req, res);
  if (!base) return;

  const {
    plantCode,
    origin,
    materialCode,
    batchNumber,
    vendorCode,
    usageDecision
  } = base;

  const { resultText } = req.body;

  let qualityScore = null;
  if (usageDecision === "A") {
    qualityScore = 100;
  }

  const insertSql = `
    INSERT INTO raw_material_inspections
      (plant_code, origin, material_code, batch_number,
       vendor_code, result_summary, usage_decision, quality_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertSql,
    [
      plantCode,
      origin,
      materialCode,
      batchNumber,
      vendorCode,
      resultText || null,
      usageDecision || null,
      qualityScore
    ],
    (err2, result) => {
      if (err2) {
        console.error("INSERT raw_material_inspections error:", err2);
        return res
          .status(500)
          .json({ message: "DB error", error: err2 });
      }

      const selectSql =
        "SELECT * FROM raw_material_inspections WHERE id = ?";
      db.query(selectSql, [result.insertId], (err3, rows2) => {
        if (err3) {
          console.error(
            "SELECT raw_material_inspections after insert error:",
            err3
          );
          return res
            .status(500)
            .json({ message: "DB error", error: err3 });
        }

        return res.status(201).json(mapRow(rows2[0]));
      });
    }
  );
});

// UPDATE by ID
router.put("/raw-material-inspections/:id", (req, res) => {
  const id = Number(req.params.id);
  const base = validatePayload(req, res);
  if (!base) return;

  const {
    plantCode,
    origin,
    materialCode,
    batchNumber,
    vendorCode,
    usageDecision
  } = base;

  const { resultText } = req.body;

  let qualityScore = null;
  if (usageDecision === "A") {
    qualityScore = 100;
  }

  const sql = `
    UPDATE raw_material_inspections
    SET
      plant_code = ?,
      origin = ?,
      material_code = ?,
      batch_number = ?,
      vendor_code = ?,
      result_summary = ?,
      usage_decision = ?,
      quality_score = ?
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(
    sql,
    [
      plantCode,
      origin,
      materialCode,
      batchNumber,
      vendorCode,
      resultText || null,
      usageDecision || null,
      qualityScore,
      id
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE raw_material_inspections by id error:", err);
        return res
          .status(500)
          .json({ message: "DB error", error: err });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Not found or already deleted" });
      }

      const selectSql =
        "SELECT * FROM raw_material_inspections WHERE id = ?";
      db.query(selectSql, [id], (err2, rows2) => {
        if (err2) {
          console.error(
            "SELECT raw_material_inspections after update-by-id error:",
            err2
          );
          return res
            .status(500)
            .json({ message: "DB error", error: err2 });
        }

        return res.json(mapRow(rows2[0]));
      });
    }
  );
});

// SOFT DELETE
router.delete("/raw-material-inspections/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE raw_material_inspections
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("SOFT DELETE raw_material_inspections error:", err);
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
router.post("/raw-material-inspections/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE raw_material_inspections
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ? AND is_deleted = 1
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("RESTORE raw_material_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Not found or not in recycle bin" });
    }

    const selectSql =
      "SELECT * FROM raw_material_inspections WHERE id = ?";
    db.query(selectSql, [id], (err2, rows) => {
      if (err2) {
        console.error(
          "SELECT raw_material_inspections after restore error:",
          err2
        );
        return res
          .status(500)
          .json({ message: "DB error", error: err2 });
      }

      res.json(mapRow(rows[0]));
    });
  });
});

// HARD DELETE
router.delete("/raw-material-inspections/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "DELETE FROM raw_material_inspections WHERE id = ? AND is_deleted = 1";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("HARD DELETE raw_material_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
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