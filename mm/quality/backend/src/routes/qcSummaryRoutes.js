// backend/src/routes/qcSummaryRoutes.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    // total lots + by status
    const [lotCounts] = await db.query(
      `SELECT status, COUNT(*) AS cnt
       FROM qc_lots
       GROUP BY status`
    );

    const [lotTotalRows] = await db.query(
      `SELECT COUNT(*) AS total FROM qc_lots`
    );
    const lotTotal = lotTotalRows[0].total;

    // total QC plans (one per material)
    const [planRows] = await db.query(
      `SELECT COUNT(*) AS total FROM qc_plans`
    );

    // CAPA counts
    const [capaCounts] = await db.query(
      `SELECT status, COUNT(*) AS cnt
       FROM capa
       GROUP BY status`
    );

    const [capaTotalRows] = await db.query(
      `SELECT COUNT(*) AS total FROM capa`
    );
    const capaTotal = capaTotalRows[0].total;

    res.json({
      lots: {
        total: lotTotal,
        byStatus: Object.fromEntries(
          lotCounts.map(r => [r.status, r.cnt])
        )
      },
      plans: {
        total: planRows[0].total
      },
      capa: {
        total: capaTotal,
        byStatus: Object.fromEntries(
          capaCounts.map(r => [r.status, r.cnt])
        )
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load QC summary" });
  }
});

export default router;
