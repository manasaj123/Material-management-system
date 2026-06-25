const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ================= GET QC AUDIT REPORTS ================= */
router.get("/reports", (req, res) => {
  const sql = `
    SELECT 
      r.id,
      r.lot_id,
      l.lot_number,
      r.findings,
      r.decision,
      r.created_at
    FROM qc_reports r
    LEFT JOIN lots l ON l.id = r.lot_id
    ORDER BY r.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ================= CREATE QC REPORT (AUTO / MANUAL) ================= */
router.post("/reports", (req, res) => {
  const { lot_id, findings, decision } = req.body;

  const sql =
    "INSERT INTO qc_reports (lot_id, findings, decision) VALUES (?, ?, ?)";

  db.query(sql, [lot_id, findings, decision], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "QC Report created" });
  });
});

module.exports = router;
