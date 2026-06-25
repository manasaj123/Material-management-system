const Inventory = require('../models/Inventory');

module.exports = {
  getFIFO: async (req, res) => {
    try {
      const [items] = await Inventory.getFIFO(req.params.itemId, 10);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
