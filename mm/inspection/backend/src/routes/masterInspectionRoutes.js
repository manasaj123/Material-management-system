const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET active inspections (is_deleted = 0)
router.get("/master-inspections", (req, res) => {
  const sql = `
    SELECT
      id,
      plant,
      inspection_name AS inspectionName,
      DATE_FORMAT(valid_from, '%Y-%m-%d') AS validFrom,
      DATE_FORMAT(valid_to, '%Y-%m-%d') AS validTo,
      status,
      lower_spec_limit AS lowerSpecLimit,
      target_value AS targetValue,
      upper_spec_limit AS upperSpecLimit,
      is_deleted AS isDeleted,
      deleted_at AS deletedAt
    FROM master_inspections
    WHERE is_deleted = 0
    ORDER BY id ASC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET /master-inspections error:", err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json(rows || []);
  });
});

// GET recycle bin items (is_deleted = 1)
router.get("/master-inspections/recycle-bin", (req, res) => {
  const sql = `
    SELECT
      id,
      plant,
      inspection_name AS inspectionName,
      DATE_FORMAT(valid_from, '%Y-%m-%d') AS validFrom,
      DATE_FORMAT(valid_to, '%Y-%m-%d') AS validTo,
      status,
      lower_spec_limit AS lowerSpecLimit,
      target_value AS targetValue,
      upper_spec_limit AS upperSpecLimit,
      is_deleted AS isDeleted,
      deleted_at AS deletedAt
    FROM master_inspections
    WHERE is_deleted = 1
    ORDER BY id ASC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET /master-inspections/recycle-bin error:", err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json(rows || []);
  });
});

// CREATE
router.post("/master-inspections", (req, res) => {
  const body = req.body;

  const sql = `
    INSERT INTO master_inspections
      (plant, inspection_name, valid_from, valid_to, status,
       lower_spec_limit, target_value, upper_spec_limit, is_deleted, deleted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
  `;

  const params = [
    body.plant,
    body.inspectionName,
    body.validFrom,
    body.validTo || null,
    body.status,
    body.lowerSpecLimit === "" ? null : body.lowerSpecLimit,
    body.targetValue === "" ? null : body.targetValue,
    body.upperSpecLimit === "" ? null : body.upperSpecLimit
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("POST /master-inspections error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    const newId = result.insertId;

    const selectSql = `
      SELECT
        id,
        plant,
        inspection_name AS inspectionName,
        DATE_FORMAT(valid_from, '%Y-%m-%d') AS validFrom,
        DATE_FORMAT(valid_to, '%Y-%m-%d') AS validTo,
        status,
        lower_spec_limit AS lowerSpecLimit,
        target_value AS targetValue,
        upper_spec_limit AS upperSpecLimit,
        is_deleted AS isDeleted,
        deleted_at AS deletedAt
      FROM master_inspections
      WHERE id = ?
    `;
    db.query(selectSql, [newId], (err2, rows) => {
      if (err2) {
        console.error("POST /master-inspections select error:", err2);
        return res.status(500).json({ message: "DB error" });
      }
      res.status(201).json(rows[0]);
    });
  });
});

// UPDATE
router.put("/master-inspections/:id", (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;

  const sql = `
    UPDATE master_inspections
    SET
      plant = ?,
      inspection_name = ?,
      valid_from = ?,
      valid_to = ?,
      status = ?,
      lower_spec_limit = ?,
      target_value = ?,
      upper_spec_limit = ?
    WHERE id = ?
  `;

  const params = [
    body.plant,
    body.inspectionName,
    body.validFrom,
    body.validTo || null,
    body.status,
    body.lowerSpecLimit === "" ? null : body.lowerSpecLimit,
    body.targetValue === "" ? null : body.targetValue,
    body.upperSpecLimit === "" ? null : body.upperSpecLimit,
    id
  ];

  db.query(sql, params, err => {
    if (err) {
      console.error("PUT /master-inspections/:id error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    const selectSql = `
      SELECT
        id,
        plant,
        inspection_name AS inspectionName,
        DATE_FORMAT(valid_from, '%Y-%m-%d') AS validFrom,
        DATE_FORMAT(valid_to, '%Y-%m-%d') AS validTo,
        status,
        lower_spec_limit AS lowerSpecLimit,
        target_value AS targetValue,
        upper_spec_limit AS upperSpecLimit,
        is_deleted AS isDeleted,
        deleted_at AS deletedAt
      FROM master_inspections
      WHERE id = ?
    `;
    db.query(selectSql, [id], (err2, rows) => {
      if (err2) {
        console.error("PUT /master-inspections/:id select error:", err2);
        return res.status(500).json({ message: "DB error" });
      }
      if (!rows.length) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(rows[0]);
    });
  });
});

// SOFT DELETE -> move to recycle bin (set is_deleted = 1)
router.delete("/master-inspections/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE master_inspections
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE /master-inspections/:id error:", err);
      return res.status(500).json({ message: "DB error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Moved to recycle bin" });
  });
});

// RESTORE from recycle bin (set is_deleted = 0)
router.post("/master-inspections/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE master_inspections
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("POST /master-inspections/:id/restore error:", err);
      return res.status(500).json({ message: "DB error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    const selectSql = `
      SELECT
        id,
        plant,
        inspection_name AS inspectionName,
        DATE_FORMAT(valid_from, '%Y-%m-%d') AS validFrom,
        DATE_FORMAT(valid_to, '%Y-%m-%d') AS validTo,
        status,
        lower_spec_limit AS lowerSpecLimit,
        target_value AS targetValue,
        upper_spec_limit AS upperSpecLimit,
        is_deleted AS isDeleted,
        deleted_at AS deletedAt
      FROM master_inspections
      WHERE id = ?
    `;
    db.query(selectSql, [id], (err2, rows) => {
      if (err2) {
        console.error("POST /master-inspections/:id/restore select error:", err2);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(rows[0]);
    });
  });
});

// HARD DELETE from recycle bin
router.delete("/master-inspections/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    DELETE FROM master_inspections
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE /master-inspections/:id/hard-delete error:", err);
      return res.status(500).json({ message: "DB error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Permanently deleted" });
  });
});

module.exports = router;