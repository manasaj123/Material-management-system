// inspection/backend/src/routes/inProcessInspectionRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // mysql2 pool

/* ============================================================
   GET ACTIVE IN-PROCESS INSPECTIONS
============================================================ */
router.get("/in-process-inspections", (req, res) => {
  const sql =
    "SELECT * FROM in_process_inspections WHERE is_deleted = 0 ORDER BY id DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET in_process_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      materialCode: r.material_code,
      productionPlant: r.production_plant,
      planningPlant: r.planning_plant,
      orderType: r.order_type,
      orderNo: r.order_no,
      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

/* ============================================================
   GET RECYCLE BIN
============================================================ */
router.get("/in-process-inspections/recycle-bin", (req, res) => {
  const sql =
    "SELECT * FROM in_process_inspections WHERE is_deleted = 1 ORDER BY deleted_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET in_process_inspections recycle-bin error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      materialCode: r.material_code,
      productionPlant: r.production_plant,
      planningPlant: r.planning_plant,
      orderType: r.order_type,
      orderNo: r.order_no,
      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

/* ============================================================
   CREATE IN-PROCESS INSPECTION
============================================================ */
router.post("/in-process-inspections", (req, res) => {
  const {
    materialCode,
    productionPlant,
    planningPlant,
    orderType,
    orderNo
  } = req.body;

  const sql = `
    INSERT INTO in_process_inspections
      (material_code, production_plant, planning_plant, order_type, order_no)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      materialCode || null,
      productionPlant || null,
      planningPlant || null,
      orderType || null,
      orderNo || null
    ],
    (err) => {
      if (err) {
        console.error("INSERT in_process_inspections error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      res.status(201).json({ message: "In-process inspection created" });
    }
  );
});

/* ============================================================
   UPDATE IN-PROCESS INSPECTION
============================================================ */
router.put("/in-process-inspections/:id", (req, res) => {
  const id = Number(req.params.id);
  const {
    materialCode,
    productionPlant,
    planningPlant,
    orderType,
    orderNo
  } = req.body;

  const sql = `
    UPDATE in_process_inspections
    SET material_code = ?,
        production_plant = ?,
        planning_plant = ?,
        order_type = ?,
        order_no = ?
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(
    sql,
    [
      materialCode || null,
      productionPlant || null,
      planningPlant || null,
      orderType || null,
      orderNo || null,
      id
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE in_process_inspections error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json({ message: "In-process inspection updated" });
    }
  );
});

/* ============================================================
   SOFT DELETE (MOVE TO RECYCLE BIN)
============================================================ */
router.delete("/in-process-inspections/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE in_process_inspections
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("SOFT DELETE in_process_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Moved to recycle bin" });
  });
});

/* ============================================================
   RESTORE FROM RECYCLE BIN
============================================================ */
router.post("/in-process-inspections/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE in_process_inspections
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ? AND is_deleted = 1
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("RESTORE in_process_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Restored successfully" });
  });
});

/* ============================================================
   HARD DELETE (PERMANENT)
============================================================ */
router.delete("/in-process-inspections/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "DELETE FROM in_process_inspections WHERE id = ? AND is_deleted = 1";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("HARD DELETE in_process_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Permanently deleted" });
  });
});

module.exports = router;
