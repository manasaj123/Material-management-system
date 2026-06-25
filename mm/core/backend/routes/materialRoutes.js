import express from "express";
import db from "../config/db.js";

const router = express.Router();


router.get("/", (req, res) => {
  db.query("SELECT * FROM materials ORDER BY id DESC", (err, result) => {
    if (err) {
      console.error("Materials GET Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});


router.post("/", (req, res) => {
  const { name, qty, unit, shelfLife, issueType } = req.body;
  
  console.log("Adding material:", { name, qty, unit, shelfLife, issueType });
  
  db.query(
    "INSERT INTO materials (name, qty, unit, shelf_life, issue_type) VALUES (?, ?, ?, ?, ?)",
    [name, qty, unit, shelfLife, issueType || 'FIFO'],
    (err, result) => {
      if (err) {
        console.error("Materials Insert Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: result.insertId, success: true });
    }
  );
});

export default router;
