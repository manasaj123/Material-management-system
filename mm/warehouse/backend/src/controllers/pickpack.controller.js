const Pick = require('../models/Pick');

module.exports = {
  createPick: async (req, res) => {
    try {
      const id = await Pick.create(req.body);
      res.status(201).json({ id, pick_no: req.body.pick_no });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPendingPicks: async (req, res) => {
    try {
      const [picks] = await Pick.getPending();
      res.json(picks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markPacked: async (req, res) => {
    try {
      await Pick.updateStatus(req.params.id, 'packed');
      res.json({ message: 'Pick marked as packed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
