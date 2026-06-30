const db = require('../config/db');
const { Audit, User } = db;

exports.list = async (req, res, next) => {
  try {
    const logs = await Audit.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};
