const db = require('../config/db');
const { CostCenter } = db;

exports.create = async (req, res, next) => {
  try {
    const center = await CostCenter.create(req.body);
    res.status(201).json(center);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const centers = await CostCenter.findAll({ order: [['code', 'ASC']] });
    res.json(centers);
  } catch (err) {
    next(err);
  }
};
