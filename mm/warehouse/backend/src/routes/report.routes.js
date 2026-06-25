const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    // Average putaway time
    const [[putawayRow]] = await db.execute(
      `SELECT AVG(TIMESTAMPDIFF(MINUTE, received_date, putaway_date)) AS avg_putaway_time
       FROM grn
       WHERE status = 'complete'
         AND putaway_date IS NOT NULL`
    );

    // Total GRNs
    const [[totalGrnsRow]] = await db.execute(
      `SELECT COUNT(*) AS total_grns FROM grn`
    );

    // Pick Accuracy
    let pickAccuracy = 100;
    try {
      const [[pickRow]] = await db.execute(
        `SELECT 
           (SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS pick_accuracy
         FROM picks`
      );
      pickAccuracy = pickRow?.pick_accuracy || 100;
    } catch (err) {
      console.log('Pick accuracy query failed (table might not have is_correct column):', err.message);
      pickAccuracy = 100;
    }

    // Inventory Accuracy - FIX: Specify which table's variance column to use
    let inventoryAccuracy = 0;
    try {
      const [[accRow]] = await db.execute(`
        SELECT 
          (1 - (SUM(ABS(cc.variance)) / NULLIF(SUM(ccr.system_qty), 0))) * 100 AS inventory_accuracy
        FROM cycle_count_results ccr
        JOIN cycle_counts cc ON cc.id = ccr.cycle_count_id
        WHERE cc.scheduled_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `);
      
      inventoryAccuracy = accRow?.inventory_accuracy || 0;
    } catch (err) {
      console.log('Inventory accuracy query failed:', err.message);
      inventoryAccuracy = 0;
    }

    res.json({
      avg_putaway_time: putawayRow?.avg_putaway_time || 0,
      pick_accuracy: pickAccuracy || 100,
      total_grns: totalGrnsRow?.total_grns || 0,
      inventory_accuracy: inventoryAccuracy || 0
    });

  } catch (err) {
    console.error('Metrics error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;