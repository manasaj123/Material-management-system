// routes/samplingProcedureRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // mysql2 pool

// GET active sampling procedures (not deleted)
router.get("/sampling-procedures", (req, res) => {
  const sql =
    "SELECT * FROM sampling_procedures WHERE is_deleted = 0 ORDER BY id DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET sampling_procedures error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      procedureCode: r.procedure_code,
      description: r.description,
      samplingType: r.sampling_type,
      valuationMode: r.valuation_mode,
      inspectionPoints: r.inspection_points,
      sampleSize: r.sample_size,
      acceptanceNumber: r.acceptance_number,
      multipleSamples: r.multiple_samples,
      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

// GET recycle bin (deleted = 1)
router.get("/sampling-procedures/recycle-bin", (req, res) => {
  const sql =
    "SELECT * FROM sampling_procedures WHERE is_deleted = 1 ORDER BY deleted_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET sampling_procedures recycle-bin error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      procedureCode: r.procedure_code,
      description: r.description,
      samplingType: r.sampling_type,
      valuationMode: r.valuation_mode,
      inspectionPoints: r.inspection_points,
      sampleSize: r.sample_size,
      acceptanceNumber: r.acceptance_number,
      multipleSamples: r.multiple_samples,
      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

// CREATE
router.post("/sampling-procedures", (req, res) => {
  const {
    procedureCode,
    description,
    samplingType,
    valuationMode,
    inspectionPoints,
    sampleSize,
    acceptanceNumber,
    multipleSamples
  } = req.body;

  const sql = `
    INSERT INTO sampling_procedures
      (procedure_code, description, sampling_type, valuation_mode,
       inspection_points, sample_size, acceptance_number, multiple_samples)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      procedureCode,
      description || null,
      samplingType,
      valuationMode || null,
      inspectionPoints,
      sampleSize || null,
      acceptanceNumber || null,
      multipleSamples || "NO_MULTIPLE_SAMPLES"
    ],
    (err, result) => {
      if (err) {
        console.error("INSERT sampling_procedures error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      const selectSql = "SELECT * FROM sampling_procedures WHERE id = ?";
      db.query(selectSql, [result.insertId], (err2, rows) => {
        if (err2) {
          console.error(
            "SELECT sampling_procedures after insert error:",
            err2
          );
          return res
            .status(500)
            .json({ message: "DB error", error: err2 });
        }

        const r = rows[0];
        res.status(201).json({
          id: r.id,
          procedureCode: r.procedure_code,
          description: r.description,
          samplingType: r.sampling_type,
          valuationMode: r.valuation_mode,
          inspectionPoints: r.inspection_points,
          sampleSize: r.sample_size,
          acceptanceNumber: r.acceptance_number,
          multipleSamples: r.multiple_samples,
          isDeleted: !!r.is_deleted,
          deletedAt: r.deleted_at,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        });
      });
    }
  );
});

// UPDATE
router.put("/sampling-procedures/:id", (req, res) => {
  const id = Number(req.params.id);
  const {
    procedureCode,
    description,
    samplingType,
    valuationMode,
    inspectionPoints,
    sampleSize,
    acceptanceNumber,
    multipleSamples
  } = req.body;

  const sql = `
    UPDATE sampling_procedures
    SET procedure_code = ?, description = ?, sampling_type = ?,
        valuation_mode = ?, inspection_points = ?,
        sample_size = ?, acceptance_number = ?, multiple_samples = ?
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(
    sql,
    [
      procedureCode,
      description || null,
      samplingType,
      valuationMode || null,
      inspectionPoints,
      sampleSize || null,
      acceptanceNumber || null,
      multipleSamples || "NO_MULTIPLE_SAMPLES",
      id
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE sampling_procedures error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Not found or already deleted" });
      }

      const selectSql = "SELECT * FROM sampling_procedures WHERE id = ?";
      db.query(selectSql, [id], (err2, rows) => {
        if (err2) {
          console.error(
            "SELECT sampling_procedures after update error:",
            err2
          );
          return res
            .status(500)
            .json({ message: "DB error", error: err2 });
        }

        const r = rows[0];
        res.json({
          id: r.id,
          procedureCode: r.procedure_code,
          description: r.description,
          samplingType: r.sampling_type,
          valuationMode: r.valuation_mode,
          inspectionPoints: r.inspection_points,
          sampleSize: r.sample_size,
          acceptanceNumber: r.acceptance_number,
          multipleSamples: r.multiple_samples,
          isDeleted: !!r.is_deleted,
          deletedAt: r.deleted_at,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        });
      });
    }
  );
});

// SOFT DELETE -> move to recycle bin
router.delete("/sampling-procedures/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE sampling_procedures
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("SOFT DELETE sampling_procedures error:", err);
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

// RESTORE from recycle bin
router.post("/sampling-procedures/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE sampling_procedures
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ? AND is_deleted = 1
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("RESTORE sampling_procedures error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Not found or not in recycle bin" });
    }

    const selectSql = "SELECT * FROM sampling_procedures WHERE id = ?";
    db.query(selectSql, [id], (err2, rows) => {
      if (err2) {
        console.error(
          "SELECT sampling_procedures after restore error:",
          err2
        );
        return res
          .status(500)
          .json({ message: "DB error", error: err2 });
      }

      const r = rows[0];
      res.json({
        id: r.id,
        procedureCode: r.procedure_code,
        description: r.description,
        samplingType: r.sampling_type,
        valuationMode: r.valuation_mode,
        inspectionPoints: r.inspection_points,
        sampleSize: r.sample_size,
        acceptanceNumber: r.acceptance_number,
        multipleSamples: r.multiple_samples,
        isDeleted: !!r.is_deleted,
        deletedAt: r.deleted_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      });
    });
  });
});

// HARD DELETE (permanent) from recycle bin
router.delete("/sampling-procedures/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "DELETE FROM sampling_procedures WHERE id = ? AND is_deleted = 1";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("HARD DELETE sampling_procedures error:", err);
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
