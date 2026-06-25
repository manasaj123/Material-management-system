const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [inventory] = await db.execute(`
      SELECT 
        i.id,
        i.item_id, 
        i.bin_id,       -- ✅ ADD THIS LINE
        i.qty, 
        i.expiry_date, 
        i.batch_no,
        it.sku, 
        it.name, 
        b.bin_code, 
        b.zone
      FROM inventory i
      JOIN items it ON i.item_id = it.id
      JOIN bins b ON i.bin_id = b.id
      WHERE i.qty > 0
      ORDER BY i.expiry_date ASC
    `);
    
    console.log('📦 Inventory loaded:', inventory.length, 'records');
    res.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/fifo/:itemId', async (req, res) => {
  try {
    const [items] = await db.execute(`
      SELECT * FROM inventory 
      WHERE item_id = ? AND qty > 0 
      ORDER BY expiry_date ASC 
      LIMIT 5`, [req.params.itemId]);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const [result] = await db.execute(`
      INSERT INTO inventory (item_id, bin_id, qty, batch_no, expiry_date) 
      VALUES (?, ?, ?, ?, ?)`, 
      [req.body.item_id, req.body.bin_id, req.body.qty, req.body.batch_no, req.body.expiry_date]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;