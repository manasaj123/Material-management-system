// backend/src/controllers/assetClassController.js
const db = require('../config/db');
const { AssetClass } = db;

exports.list = async (req, res) => {
  try {
    const list = await AssetClass.findAll({ order: [['code', 'ASC']] });
    res.json(list);
  } catch (err) {
    console.error('AssetClass list error', err);
    res.status(500).json({ message: 'Failed to load asset classes' });
  }
};

exports.create = async (req, res) => {
  try {
    const ac = await AssetClass.create(req.body);
    res.status(201).json(ac);
  } catch (err) {
    console.error('AssetClass create error', err);
    res.status(500).json({ message: 'Failed to create asset class' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const ac = await AssetClass.findByPk(id);
    if (!ac) return res.status(404).json({ message: 'Asset class not found' });
    await ac.update(req.body);
    res.json(ac);
  } catch (err) {
    console.error('AssetClass update error', err);
    res.status(500).json({ message: 'Failed to update asset class' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const ac = await AssetClass.findByPk(id);
    if (!ac) return res.status(404).json({ message: 'Asset class not found' });
    await ac.destroy();
    res.json({ message: 'Asset class deleted' });
  } catch (err) {
    console.error('AssetClass delete error', err);
    res.status(500).json({ message: 'Failed to delete asset class' });
  }
};