// inspection/backend/src/routes/finalInspectionRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ============================================================
   GET ACTIVE FINAL INSPECTIONS
============================================================ */
router.get("/final-inspections", (req, res) => {
  const sql =
    "SELECT * FROM final_inspections WHERE is_deleted = 0 ORDER BY id DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET final_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      materialCode: r.material_code,
      productionPlant: r.production_plant,
      orderType: r.order_type,
      orderQuantity: r.order_quantity,
      orderDate: r.order_date,
      planCode: r.plan_code,
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
router.get("/final-inspections/recycle-bin", (req, res) => {
  const sql =
    "SELECT * FROM final_inspections WHERE is_deleted = 1 ORDER BY deleted_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET final_inspections recycle-bin error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      materialCode: r.material_code,
      productionPlant: r.production_plant,
      orderType: r.order_type,
      orderQuantity: r.order_quantity,
      orderDate: r.order_date,
      planCode: r.plan_code,
      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

/* ============================================================
   CREATE FINAL INSPECTION
============================================================ */
router.post("/final-inspections", (req, res) => {
  const {
    materialCode,
    productionPlant,
    orderType,
    orderQuantity,
    orderDate,
    planCode
  } = req.body;

  const sql = `
    INSERT INTO final_inspections
      (material_code, production_plant, order_type,
       order_quantity, order_date, plan_code)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      materialCode || null,
      productionPlant || null,
      orderType || null,
      orderQuantity || null,
      orderDate || null,
      planCode || null
    ],
    (err) => {
      if (err) {
        console.error("INSERT final_inspections error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      res.status(201).json({ message: "Final inspection created" });
    }
  );
});

/* ============================================================
   UPDATE FINAL INSPECTION
============================================================ */
router.put("/final-inspections/:id", (req, res) => {
  const id = Number(req.params.id);
  const {
    materialCode,
    productionPlant,
    orderType,
    orderQuantity,
    orderDate,
    planCode
  } = req.body;

  const sql = `
    UPDATE final_inspections
    SET material_code = ?,
        production_plant = ?,
        order_type = ?,
        order_quantity = ?,
        order_date = ?,
        plan_code = ?
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(
    sql,
    [
      materialCode || null,
      productionPlant || null,
      orderType || null,
      orderQuantity || null,
      orderDate || null,
      planCode || null,
      id
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE final_inspections error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json({ message: "Final inspection updated" });
    }
  );
});

/* ============================================================
   SOFT DELETE (MOVE TO RECYCLE BIN)
============================================================ */
router.delete("/final-inspections/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE final_inspections
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("SOFT DELETE final_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Moved to recycle bin" });
  });
});

/* ============================================================
   RESTORE FROM RECYCLE BIN
============================================================ */
router.post("/final-inspections/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE final_inspections
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ? AND is_deleted = 1
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("RESTORE final_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Restored successfully" });
  });
});

/* ============================================================
   HARD DELETE (PERMANENT)
============================================================ */
router.delete("/final-inspections/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "DELETE FROM final_inspections WHERE id = ? AND is_deleted = 1";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("HARD DELETE final_inspections error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Permanently deleted" });
  });
});

module.exports = router;
