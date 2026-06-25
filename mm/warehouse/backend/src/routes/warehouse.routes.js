const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Get all warehouses
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM warehouses');
    res.json(rows);
  } catch (err) {
    console.error('Get warehouses error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all bins with auto-calculated usage from inventory table
router.get('/:id/bins', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await db.execute(
      `SELECT 
        b.id,
        b.warehouse_id,
        b.bin_code,
        b.capacity,
        b.zone,
        COALESCE(SUM(i.qty), 0) as current_usage
      FROM bins b
      LEFT JOIN inventory i ON b.id = i.bin_id
      WHERE b.warehouse_id = ?
      GROUP BY b.id, b.warehouse_id, b.bin_code, b.capacity, b.zone
      ORDER BY b.zone, b.bin_code`,
      [id]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Get bins error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new bin with validation
router.post('/:warehouseId/bins', async (req, res) => {
  const { warehouseId } = req.params;
  const { bin_code, capacity, zone } = req.body;

  // Validation
  if (!bin_code || !bin_code.trim()) {
    return res.status(400).json({ error: 'Bin code is required' });
  }

  const binCodePattern = /^[A-Z0-9\-]+$/i;
  if (!binCodePattern.test(bin_code.trim())) {
    return res.status(400).json({ 
      error: 'Bin code can only contain letters, numbers, and dashes' 
    });
  }

  if (!capacity || capacity <= 0) {
    return res.status(400).json({ error: 'Capacity must be greater than 0' });
  }

  const validZones = ['A', 'B', 'C', 'DH', 'FR'];
  if (!zone || !validZones.includes(zone)) {
    return res.status(400).json({ 
      error: `Zone must be one of: ${validZones.join(', ')}` 
    });
  }

  try {
    // Check for duplicate bin_code
    const [existing] = await db.execute(
      'SELECT id FROM bins WHERE warehouse_id = ? AND bin_code = ?',
      [warehouseId, bin_code.trim().toUpperCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        error: `Bin code '${bin_code}' already exists in this warehouse` 
      });
    }

    // Insert new bin
    await db.execute(
      `INSERT INTO bins (warehouse_id, bin_code, capacity, zone)
       VALUES (?, ?, ?, ?)`,
      [warehouseId, bin_code.trim().toUpperCase(), capacity, zone]
    );

    res.status(201).json({ message: 'Bin created successfully' });
  } catch (err) {
    console.error('Create bin error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get inventory in a specific bin
router.get('/:warehouseId/bins/:binId/inventory', async (req, res) => {
  const { binId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT 
        i.id,
        i.qty,
        i.batch_no,
        i.expiry_date,
        it.item_code as sku,
        it.item_name as name,
        b.bin_code
       FROM inventory i
       LEFT JOIN items it ON i.item_id = it.id
       LEFT JOIN bins b ON i.bin_id = b.id
       WHERE i.bin_id = ?
       ORDER BY it.item_code`,
      [binId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get bin inventory error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete bin (only if empty)
router.delete('/:warehouseId/bins/:binId', async (req, res) => {
  const { binId } = req.params;

  try {
    // Check if bin has inventory
    const [inventory] = await db.execute(
      'SELECT COALESCE(SUM(qty), 0) as total_qty FROM inventory WHERE bin_id = ?',
      [binId]
    );

    if (inventory[0].total_qty > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete bin with inventory. Please empty it first.' 
      });
    }

    await db.execute('DELETE FROM bins WHERE id = ?', [binId]);
    res.json({ message: 'Bin deleted successfully' });
  } catch (err) {
    console.error('Delete bin error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;