const Item = require('../models/Item');

module.exports = {
  getAll: async (req, res) => {
    try {
      const [items] = await Item.findAll();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  createItem: async (req, res) => {
    try {
      const id = await Item.create(req.body);
      res.status(201).json({ id, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
