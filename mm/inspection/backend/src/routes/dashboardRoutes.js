const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/counts", (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(status='APPROVED') AS approved,
      SUM(status='REJECTED') AS rejected,
       SUM(status='PENDING') AS pending
    FROM lots
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

module.exports = router;
