// src/controllers/clearingController.js
const db = require('../config/db');
const { Clearing, Invoice, Payment } = db;
const { Op } = require('sequelize');

exports.createClearing = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { invoiceId, paymentId, clearedAmount, clearingDate, remainingAmount } = req.body;

    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice || invoice.balanceAmount <= 0) {
      return res.status(400).json({ message: 'Invoice is fully paid or not found' });
    }

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(400).json({ message: 'Payment not found' });
    }

    const clearing = await Clearing.create({
      invoiceId,
      paymentId,
      clearedAmount,
      clearingDate,
      remainingAmount,
      createdBy: req.user.id
    }, { transaction: t });

    await Invoice.update(
      { balanceAmount: remainingAmount },
      { where: { id: invoiceId }, transaction: t }
    );

    const totalCleared = await Clearing.sum('clearedAmount', {
      where: { paymentId }
    });

    if (totalCleared >= payment.amount) {
      await Payment.update(
        { status: 'FULLY_USED' },
        { where: { id: paymentId }, transaction: t }
      );
    }

    await t.commit();
    res.status(201).json(clearing);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.listClearings = async (req, res) => {
  try {
    const { party } = req.query;
    const invoiceWhere = {};
    if (party) {
      invoiceWhere.partyName = { [Op.like]: `%${party}%` };
    }

    const clearings = await Clearing.findAll({
      include: [
        {
          model: Invoice,
          attributes: ['invoiceNumber', 'partyName', 'type', 'balanceAmount'],
          where: invoiceWhere
        },
        {
          model: Payment,
          attributes: ['paymentNumber', 'amount']
        }
      ],
      order: [['clearingDate', 'DESC']]
    });

    res.json(clearings);
  } catch (err) {
    console.error('listClearings error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOpenInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: {
        balanceAmount: { [db.Op.gt]: 0 },
        status: { [db.Op.notIn]: ['CANCELLED'] }
      },
      order: [['dueDate', 'ASC']]
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};