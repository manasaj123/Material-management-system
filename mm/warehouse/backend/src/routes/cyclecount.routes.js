const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Get pending cycle counts with details
router.get('/pending', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        cc.id,
        cc.warehouse_id,
        cc.bin_id,
        cc.item_id,
        cc.scheduled_date,
        cc.status,
        w.name as warehouse_name,
        b.bin_code,
        b.zone,
        i.sku,
        i.name as item_name
      FROM cycle_counts cc
      LEFT JOIN warehouses w ON cc.warehouse_id = w.id
      LEFT JOIN bins b ON cc.bin_id = b.id
      LEFT JOIN items i ON cc.item_id = i.id
      WHERE cc.status = 'pending'
      ORDER BY cc.scheduled_date ASC, cc.id ASC
    `);
    
    console.log('🔍 Pending cycle counts loaded:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Get pending cycle counts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new cycle count
router.post('/', async (req, res) => {
  const { warehouse_id, bin_id, item_id, scheduled_date } = req.body;

  try {
    // Validate inputs
    const warehouseId = parseInt(warehouse_id, 10);
    const binId = parseInt(bin_id, 10);
    const itemId = parseInt(item_id, 10);

    if (!warehouseId || !binId || !itemId) {
      return res.status(400).json({ error: 'Warehouse, Bin, and Item are required' });
    }

    if (!scheduled_date) {
      return res.status(400).json({ error: 'Scheduled date is required' });
    }

    // Check if warehouse exists
    const [warehouse] = await db.execute('SELECT id FROM warehouses WHERE id = ?', [warehouseId]);
    if (warehouse.length === 0) {
      return res.status(400).json({ error: 'Warehouse not found' });
    }

    // Check if bin exists
    const [bin] = await db.execute('SELECT id FROM bins WHERE id = ?', [binId]);
    if (bin.length === 0) {
      return res.status(400).json({ error: 'Bin not found' });
    }

    // Check if item exists
    const [item] = await db.execute('SELECT id FROM items WHERE id = ?', [itemId]);
    if (item.length === 0) {
      return res.status(400).json({ error: 'Item not found' });
    }

    // Check if item exists in bin
    const [inventory] = await db.execute(
      'SELECT id FROM inventory WHERE item_id = ? AND bin_id = ?',
      [itemId, binId]
    );

    if (inventory.length === 0) {
      return res.status(400).json({ 
        error: 'This item does not exist in the selected bin' 
      });
    }

    // Create cycle count
    const [result] = await db.execute(
      `INSERT INTO cycle_counts 
       (warehouse_id, bin_id, item_id, scheduled_date, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [warehouseId, binId, itemId, scheduled_date]
    );

    console.log(`✅ Cycle count created: ID ${result.insertId}`);

    res.status(201).json({
      message: 'Cycle count created successfully',
      id: result.insertId
    });

  } catch (err) {
    console.error('Create cycle count error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Complete cycle count
router.post('/:id/complete', async (req, res) => {
  const { counted_qty } = req.body;
  const countId = parseInt(req.params.id, 10);

  try {
    // Validate
    const countedQty = parseInt(counted_qty, 10);
    if (Number.isNaN(countedQty) || countedQty < 0) {
      return res.status(400).json({ error: 'Valid counted quantity required' });
    }

    // Get cycle count details
    const [countDetails] = await db.execute(
      `SELECT 
         cc.*,
         COALESCE(SUM(inv.qty), 0) as expected_qty
       FROM cycle_counts cc
       LEFT JOIN inventory inv ON cc.item_id = inv.item_id AND cc.bin_id = inv.bin_id
       WHERE cc.id = ?
       GROUP BY cc.id`,
      [countId]
    );

    if (countDetails.length === 0) {
      return res.status(404).json({ error: 'Cycle count not found' });
    }

    const count = countDetails[0];

    if (count.status !== 'pending') {
      return res.status(400).json({ error: 'This cycle count is already completed' });
    }

    const expectedQty = Number(count.expected_qty);
    const variance = countedQty - expectedQty;

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Update cycle count record
      await db.execute(
        `UPDATE cycle_counts 
         SET status = 'completed', 
             counted_qty = ?,
             variance = ?,
             completed_at = NOW()
         WHERE id = ?`,
        [countedQty, variance, countId]
      );

      // If there's a variance, adjust inventory
      if (variance !== 0) {
        // Get or create inventory record
        const [invRecord] = await db.execute(
          'SELECT id, qty FROM inventory WHERE item_id = ? AND bin_id = ?',
          [count.item_id, count.bin_id]
        );

        if (invRecord.length > 0) {
          // Update existing
          await db.execute(
            'UPDATE inventory SET qty = ? WHERE id = ?',
            [countedQty, invRecord[0].id]
          );
        } else if (countedQty > 0) {
          // Create new if counted qty > 0
          await db.execute(
            `INSERT INTO inventory (item_id, bin_id, qty, batch_no, expiry_date)
             VALUES (?, ?, ?, ?, NULL)`,
            [count.item_id, count.bin_id, countedQty, `BATCH-CC${Date.now()}`]
          );
        }

        // Update bin usage
        await db.execute(
          `UPDATE bins 
           SET current_usage = (
             SELECT COALESCE(SUM(qty), 0) 
             FROM inventory 
             WHERE bin_id = ?
           )
           WHERE id = ?`,
          [count.bin_id, count.bin_id]
        );
      }

      // Commit transaction
      await db.query('COMMIT');

      console.log(`✅ Cycle count ${countId} completed: Expected ${expectedQty}, Counted ${countedQty}, Variance ${variance}`);

      res.json({
        message: 'Cycle count completed successfully',
        expected_qty: expectedQty,
        counted_qty: countedQty,
        variance: variance
      });

    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }

  } catch (err) {
    console.error('Complete cycle count error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all cycle counts
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        cc.*,
        w.name as warehouse_name,
        b.bin_code,
        i.sku,
        i.name as item_name
      FROM cycle_counts cc
      LEFT JOIN warehouses w ON cc.warehouse_id = w.id
      LEFT JOIN bins b ON cc.bin_id = b.id
      LEFT JOIN items i ON cc.item_id = i.id
      ORDER BY cc.created_at DESC
      LIMIT 100
    `);
    
    res.json(rows);
  } catch (err) {
    console.error('Get cycle counts error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;