// backend/src/controllers/documentTypeController.js
const db = require('../config/db');
const { DocumentType } = db;

exports.list = async (req, res) => {
  try {
    const list = await DocumentType.findAll({ order: [['code', 'ASC']] });
    res.json(list);
  } catch (err) {
    console.error('DocumentType list error', err);
    res.status(500).json({ message: 'Failed to load document types' });
  }
};

exports.create = async (req, res) => {
  try {
    const dt = await DocumentType.create(req.body);
    res.status(201).json(dt);
  } catch (err) {
    console.error('DocumentType create error', err);
    res.status(500).json({ message: 'Failed to create document type' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const dt = await DocumentType.findByPk(id);
    if (!dt) {
      return res.status(404).json({ message: 'Document type not found' });
    }
    await dt.update(req.body);
    res.json(dt);
  } catch (err) {
    console.error('DocumentType update error', err);
    res.status(500).json({ message: 'Failed to update document type' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const dt = await DocumentType.findByPk(id);
    if (!dt) {
      return res.status(404).json({ message: 'Document type not found' });
    }
    await dt.destroy();
    res.json({ message: 'Document type deleted' });
  } catch (err) {
    console.error('DocumentType delete error', err);
    res.status(500).json({ message: 'Failed to delete document type' });
  }
};