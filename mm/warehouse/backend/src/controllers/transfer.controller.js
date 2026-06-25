const Transfer = require('../models/StockTransfer');
const Inventory = require('../models/Inventory');

module.exports = {
  createTransfer: async (req, res) => {
    try {
      const id = await Transfer.create(req.body);
      
      
      await Inventory.updateQty(req.body.from_bin_id, req.body.qty * -1);
      await Inventory.updateQty(req.body.to_bin_id, req.body.qty);
      
      res.status(201).json({ id, status: 'completed' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
