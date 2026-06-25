// inspection/backend/src/routes/qualityNotificationRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // mysql2 pool

/* ============================================================
   GET ACTIVE QUALITY NOTIFICATIONS
============================================================ */
router.get("/quality-notifications", (req, res) => {
  const sql =
    "SELECT * FROM quality_notifications WHERE is_deleted = 0 ORDER BY id DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET quality_notifications error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      qnNumber: r.qn_number,
      qnType: r.qn_type, // CUSTOMER / VENDOR

      purchaseOrderNo: r.purchase_order_no,
      inspectionLotNo: r.inspection_lot_no,

      defectType: r.defect_type,
      causeCodeGroup: r.cause_code_group,
      causeCode: r.cause_code,
      causeText: r.cause_text,

      taskCodeGroup: r.task_code_group,
      taskCode: r.task_code,
      taskText: r.task_text,

      activityCodeGroup: r.activity_code_group,
      activityCode: r.activity_code,
      activityText: r.activity_text,

      status: r.status, // OPEN / COMPLETED

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
router.get("/quality-notifications/recycle-bin", (req, res) => {
  const sql =
    "SELECT * FROM quality_notifications WHERE is_deleted = 1 ORDER BY deleted_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("GET quality_notifications recycle-bin error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    const mapped = rows.map(r => ({
      id: r.id,
      qnNumber: r.qn_number,
      qnType: r.qn_type,

      purchaseOrderNo: r.purchase_order_no,
      inspectionLotNo: r.inspection_lot_no,

      defectType: r.defect_type,
      causeCodeGroup: r.cause_code_group,
      causeCode: r.cause_code,
      causeText: r.cause_text,

      taskCodeGroup: r.task_code_group,
      taskCode: r.task_code,
      taskText: r.task_text,

      activityCodeGroup: r.activity_code_group,
      activityCode: r.activity_code,
      activityText: r.activity_text,

      status: r.status,

      isDeleted: !!r.is_deleted,
      deletedAt: r.deleted_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json(mapped);
  });
});

/* ============================================================
   CREATE QUALITY NOTIFICATION
============================================================ */
router.post("/quality-notifications", (req, res) => {
  const {
    qnNumber,
    qnType,

    purchaseOrderNo,
    inspectionLotNo,

    defectType,
    causeCodeGroup,
    causeCode,
    causeText,

    taskCodeGroup,
    taskCode,
    taskText,

    activityCodeGroup,
    activityCode,
    activityText,

    status
  } = req.body;

  const sql = `
    INSERT INTO quality_notifications
      (qn_number, qn_type,
       purchase_order_no, inspection_lot_no,
       defect_type, cause_code_group, cause_code, cause_text,
       task_code_group, task_code, task_text,
       activity_code_group, activity_code, activity_text,
       status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      qnNumber || "",
      qnType || "CUSTOMER",

      purchaseOrderNo || null,
      inspectionLotNo || null,

      defectType || null,
      causeCodeGroup || "QM",
      causeCode || null,
      causeText || null,

      taskCodeGroup || "QM-G2",
      taskCode || null,
      taskText || null,

      activityCodeGroup || "QM-G2",
      activityCode || null,
      activityText || null,

      status || "OPEN"
    ],
    (err) => {
      if (err) {
        console.error("INSERT quality_notifications error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      res.status(201).json({ message: "Quality notification created" });
    }
  );
});

/* ============================================================
   UPDATE QUALITY NOTIFICATION
============================================================ */
router.put("/quality-notifications/:id", (req, res) => {
  const id = Number(req.params.id);
  const {
    qnNumber,
    qnType,

    purchaseOrderNo,
    inspectionLotNo,

    defectType,
    causeCodeGroup,
    causeCode,
    causeText,

    taskCodeGroup,
    taskCode,
    taskText,

    activityCodeGroup,
    activityCode,
    activityText,

    status
  } = req.body;

  const sql = `
    UPDATE quality_notifications
    SET qn_number = ?,
        qn_type = ?,
        purchase_order_no = ?,
        inspection_lot_no = ?,
        defect_type = ?,
        cause_code_group = ?,
        cause_code = ?,
        cause_text = ?,
        task_code_group = ?,
        task_code = ?,
        task_text = ?,
        activity_code_group = ?,
        activity_code = ?,
        activity_text = ?,
        status = ?
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(
    sql,
    [
      qnNumber || "",
      qnType || "CUSTOMER",

      purchaseOrderNo || null,
      inspectionLotNo || null,

      defectType || null,
      causeCodeGroup || "QM",
      causeCode || null,
      causeText || null,

      taskCodeGroup || "QM-G2",
      taskCode || null,
      taskText || null,

      activityCodeGroup || "QM-G2",
      activityCode || null,
      activityText || null,

      status || "OPEN",

      id
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE quality_notifications error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json({ message: "Quality notification updated" });
    }
  );
});

/* ============================================================
   SOFT DELETE (MOVE TO RECYCLE BIN)
============================================================ */
router.delete("/quality-notifications/:id", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE quality_notifications
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("SOFT DELETE quality_notifications error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Moved to recycle bin" });
  });
});

/* ============================================================
   RESTORE FROM RECYCLE BIN
============================================================ */
router.post("/quality-notifications/:id/restore", (req, res) => {
  const id = Number(req.params.id);

  const sql = `
    UPDATE quality_notifications
    SET is_deleted = 0, deleted_at = NULL
    WHERE id = ? AND is_deleted = 1
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("RESTORE quality_notifications error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Restored successfully" });
  });
});

/* ============================================================
   HARD DELETE (PERMANENT)
============================================================ */
router.delete("/quality-notifications/:id/hard-delete", (req, res) => {
  const id = Number(req.params.id);

  const sql =
    "DELETE FROM quality_notifications WHERE id = ? AND is_deleted = 1";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("HARD DELETE quality_notifications error:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    res.json({ message: "Permanently deleted" });
  });
});

module.exports = router;
