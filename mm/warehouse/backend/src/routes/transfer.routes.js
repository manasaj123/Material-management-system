const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Create new transfer
router.post('/', async (req, res) => {
  const { from_bin_id, to_bin_id, item_id, qty } = req.body;

  console.log('🔄 Transfer request:', req.body);

  try {
    // Validate inputs
    const fromBinId = parseInt(from_bin_id, 10);
    const toBinId = parseInt(to_bin_id, 10);
    const itemId = parseInt(item_id, 10);
    const quantity = parseInt(qty, 10);

    if (!fromBinId || !toBinId || !itemId) {
      return res.status(400).json({ error: 'Bin IDs and Item ID are required' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    if (fromBinId === toBinId) {
      return res.status(400).json({ error: 'Source and destination bins must be different' });
    }

    // Check if bins exist
    const [fromBin] = await db.execute('SELECT id FROM bins WHERE id = ?', [fromBinId]);
    const [toBin] = await db.execute('SELECT id FROM bins WHERE id = ?', [toBinId]);

    if (fromBin.length === 0) {
      return res.status(400).json({ error: `Source bin ${fromBinId} does not exist` });
    }

    if (toBin.length === 0) {
      return res.status(400).json({ error: `Destination bin ${toBinId} does not exist` });
    }

    // Check if item exists
    const [item] = await db.execute('SELECT id FROM items WHERE id = ?', [itemId]);
    if (item.length === 0) {
      return res.status(400).json({ error: `Item ${itemId} does not exist` });
    }

    // Check available stock in source bin
    const [inventory] = await db.execute(
      `SELECT SUM(qty) as available_qty 
       FROM inventory 
       WHERE item_id = ? AND bin_id = ? AND qty > 0`,
      [itemId, fromBinId]
    );

    const availableQty = inventory[0]?.available_qty || 0;

    if (availableQty < quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock. Only ${availableQty} units available in source bin` 
      });
    }

    // Generate transfer number
    const transferNo = `TRF${Date.now()}`;

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // 1. Record the transfer
      await db.execute(
        `INSERT INTO stock_transfers 
         (transfer_no, from_bin_id, to_bin_id, item_id, qty, status, transfer_date)
         VALUES (?, ?, ?, ?, ?, 'completed', NOW())`,
        [transferNo, fromBinId, toBinId, itemId, quantity]
      );

      // 2. Deduct from source bin (FIFO - oldest first)
      const [sourceInventory] = await db.execute(
        `SELECT id, qty 
         FROM inventory 
         WHERE item_id = ? AND bin_id = ? AND qty > 0 
         ORDER BY expiry_date ASC, id ASC`,
        [itemId, fromBinId]
      );

      let remainingQty = quantity;

      for (const record of sourceInventory) {
        if (remainingQty <= 0) break;

        const deductQty = Math.min(remainingQty, record.qty);

        await db.execute(
          'UPDATE inventory SET qty = qty - ? WHERE id = ?',
          [deductQty, record.id]
        );

        remainingQty -= deductQty;
      }

      // 3. Add to destination bin
      const [destInventory] = await db.execute(
        `SELECT id, qty 
         FROM inventory 
         WHERE item_id = ? AND bin_id = ? 
         ORDER BY expiry_date DESC 
         LIMIT 1`,
        [itemId, toBinId]
      );

      if (destInventory.length > 0) {
        // Update existing record
        await db.execute(
          'UPDATE inventory SET qty = qty + ? WHERE id = ?',
          [quantity, destInventory[0].id]
        );
      } else {
        // Get batch_no and expiry_date from source
        const [sourceBatch] = await db.execute(
          `SELECT batch_no, expiry_date 
           FROM inventory 
           WHERE item_id = ? AND bin_id = ? 
           ORDER BY expiry_date ASC 
           LIMIT 1`,
          [itemId, fromBinId]
        );

        const batchNo = sourceBatch[0]?.batch_no || `BATCH-TRF${Date.now()}`;
        const expiryDate = sourceBatch[0]?.expiry_date || null;

        // Create new inventory record in destination
        await db.execute(
          `INSERT INTO inventory (item_id, bin_id, qty, batch_no, expiry_date)
           VALUES (?, ?, ?, ?, ?)`,
          [itemId, toBinId, quantity, batchNo, expiryDate]
        );
      }

      // 4. Update bin usages
      await db.execute(
        `UPDATE bins 
         SET current_usage = (
           SELECT COALESCE(SUM(qty), 0) 
           FROM inventory 
           WHERE bin_id = bins.id
         )
         WHERE id IN (?, ?)`,
        [fromBinId, toBinId]
      );

      // Commit transaction
      await db.query('COMMIT');

      console.log(`✅ Transfer ${transferNo} completed: ${quantity} units from bin ${fromBinId} to bin ${toBinId}`);

      res.status(201).json({ 
        message: 'Transfer completed successfully',
        transfer_no: transferNo,
        qty_transferred: quantity
      });

    } catch (err) {
      // Rollback on error
      await db.query('ROLLBACK');
      throw err;
    }

  } catch (err) {
    console.error('❌ Transfer error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all transfers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
         transfer_no, 
         from_bin_id, 
         to_bin_id, 
         item_id, 
         qty, 
         status, 
         transfer_date
       FROM stock_transfers
       ORDER BY transfer_date DESC
       LIMIT 100`
    );
    
    console.log('📋 Transfers loaded:', rows.length, 'records');
    res.json(rows);
  } catch (err) {
    console.error('❌ Fetch transfers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get transfer by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM stock_transfers WHERE transfer_no = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Get transfer error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;