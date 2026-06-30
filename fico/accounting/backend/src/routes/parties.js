const express = require('express');
const router = express.Router();

// Temporary static data (later you can hook to Customer/Vendor tables)
router.get('/', async (req, res) => {
  res.json([
    { id: 1, name: 'ABC Corporation', type: 'Customer' },
    { id: 2, name: 'XYZ Suppliers', type: 'Vendor' }
  ]);
});

module.exports = router;