const db = require('../config/db');
const { ProfitCenter } = db;

exports.create = async (req, res, next) => {
  try {
    const center = await ProfitCenter.create(req.body);
    res.status(201).json(center);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const centers = await ProfitCenter.findAll({ order: [['code', 'ASC']] });
    res.json(centers);
  } catch (err) {
    next(err);
  }
};
