const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM items ORDER BY sku');
    res.json(rows);
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new item
router.post('/', async (req, res) => {
  const { sku, name, unit, expiry_days } = req.body;

  try {
    // Validate SKU format
    if (!sku || !/^[A-Z0-9\-]+$/i.test(sku.trim())) {
      return res.status(400).json({ 
        error: 'SKU can only contain letters, numbers, and dashes' 
      });
    }

    // Validate Name format
    if (!name || !/^[A-Za-z0-9\s]+$/.test(name.trim())) {
      return res.status(400).json({ 
        error: 'Name can only contain letters, numbers, and spaces' 
      });
    }

    // Validate expiry_days
    const expiryDays = parseInt(expiry_days, 10);
    if (isNaN(expiryDays) || expiryDays < 0) {
      return res.status(400).json({ 
        error: 'Expiry days must be a non-negative number' 
      });
    }

    // Check for duplicate SKU
    const [existing] = await db.execute(
      'SELECT id FROM items WHERE sku = ?',
      [sku.trim().toUpperCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        error: `SKU '${sku}' already exists` 
      });
    }

    // Insert item
    await db.execute(
      'INSERT INTO items (sku, name, unit, expiry_days) VALUES (?, ?, ?, ?)',
      [sku.trim().toUpperCase(), name.trim(), unit || 'PCS', expiryDays]
    );

    res.status(201).json({ message: 'Item created successfully' });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete item (only if not in inventory)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if item exists in inventory
    const [inventory] = await db.execute(
      'SELECT COUNT(*) as count FROM inventory WHERE item_id = ?',
      [id]
    );

    if (inventory[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete item with existing inventory. Please clear stock first.' 
      });
    }

    // Delete item
    const [result] = await db.execute('DELETE FROM items WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;