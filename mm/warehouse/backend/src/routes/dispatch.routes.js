const express = require('express');
const router = express.Router();

router.get('/ready', async (req, res) => {
  
  res.json([
    { id: 1, dispatch_no: 'DSP001', pick_no: 'PICK001', status: 'ready' },
    { id: 2, dispatch_no: 'DSP002', pick_no: 'PICK002', status: 'ready' }
  ]);
});

router.put('/:id/ship', async (req, res) => {
  res.json({ message: `Dispatch ${req.params.id} shipped successfully` });
});

module.exports = router;

