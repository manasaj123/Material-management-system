// src/controllers/downPaymentController.js
const db = require('../config/db');
const { DownPayment } = db;
const { Op } = require('sequelize');

const generateDownPaymentNumber = async () => {
  const last = await DownPayment.findOne({ order: [['id', 'DESC']] });
  let next = 1;
  if (last?.downPaymentNumber) {
    const parts = String(last.downPaymentNumber).split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq)) next = seq + 1;
  }
  return `DB4-DP-${String(next).padStart(3, '0')}`;
};

exports.createDownPayment = async (req, res, next) => {
  try {
    const { partyName, type, amount, paymentDate, reference, status } = req.body;

    const dp = await DownPayment.create({
      downPaymentNumber: await generateDownPaymentNumber(),
      partyId: null,
      partyName,
      type,
      amount,
      paymentDate,
      reference,
      status: status || 'POSTED',
      createdBy: req.user.id,
      clearedAmount: 0,
      balanceAmount: amount
    });

    res.status(201).json(dp);
  } catch (err) {
    console.error('DownPayment create error:', err);
    return res.status(500).json({ message: err.message || 'Failed to create down payment' });
  }
};
exports.listDownPayments = async (req, res, next) => {
  try {
    const dps = await DownPayment.findAll({
      order: [['paymentDate', 'DESC'], ['id', 'DESC']]
    });
    res.json(dps);
  } catch (err) {
    next(err);
  }
};

exports.listOpenDownPayments = async (req, res, next) => {
  try {
    const dps = await DownPayment.findAll({
      where: {
        balanceAmount: { [Op.gt]: 0 },
        status: { [Op.notIn]: ['CANCELLED'] }
      },
      order: [['paymentDate', 'ASC']]
    });
    res.json(dps);
  } catch (err) {
    next(err);
  }
};
exports.listOpenDownPaymentsByParty = async (req, res, next) => {
  try {
    const { partyId } = req.params;
    const { type } = req.query; // optional AR/AP
    const where = {
      partyId,
      balanceAmount: { [Op.gt]: 0 },
      status: { [Op.notIn]: ['CANCELLED'] }
    };
    if (type) where.type = type;
    const dps = await DownPayment.findAll({
      where,
      order: [['paymentDate', 'ASC']]
    });
    res.json(dps);
  } catch (err) {
    next(err);
  }
};