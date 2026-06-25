const db = require("../config/db");

exports.createReport = (req, res) => {
  const { lot_id, findings, decision } = req.body;

  const sql =
    "INSERT INTO qc_reports (lot_id, findings, decision) VALUES (?, ?, ?)";

  db.query(sql, [lot_id, findings, decision], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error creating report" });
    }
    res.status(201).json({ message: "QC Audit Report Created" });
  });
};

exports.getReports = (req, res) => {
  const sql = `
    SELECT r.id, l.lot_number, r.findings, r.decision, r.created_at
    FROM qc_reports r
    JOIN lots l ON r.lot_id = l.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching reports" });
    }
    res.json(results);
  });
};