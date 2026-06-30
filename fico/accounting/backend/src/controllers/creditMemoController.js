// backend/src/controllers/creditMemoController.js
const db = require('../config/db');
const { CreditMemo, Ledger } = db;

const generateCreditMemoNumber = async () => {
  const last = await CreditMemo.findOne({ order: [['id', 'DESC']] });
  let nextSeq = 1;
  if (last?.creditMemoNumber) {
    const parts = last.creditMemoNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }
  return `DB4-CM-${String(nextSeq).padStart(3, '0')}`;
};

exports.createCreditMemo = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      type,
      partyId,
      partyName,      // must be sent from frontend
      referenceInvoice,
      amount,
      taxAmount,
      totalAmount,
      date,
      reason,
      status,
    } = req.body;

    if (!partyName) {
      await t.rollback();
      return res.status(400).json({ message: 'Party name is required' });
    }

    const creditMemoNumber = await generateCreditMemoNumber();
    const createdBy = req.user?.id || 1;

    const creditMemo = await CreditMemo.create(
      {
        creditMemoNumber,
        type,
        partyId,
        partyName,
        referenceInvoice,
        amount,
        taxAmount,
        totalAmount,
        date,
        reason,
        status: status || 'POSTED',
        createdBy,
      },
      { transaction: t }
    );

    const AR_ACCOUNT = '300001';
    const AP_ACCOUNT = '200001';
    const SALES_RETURN = '400002';
    const PURCHASE_RETURN = '500002';

    const ledgerEntries = [
      {
        date,
        accountCode: type === 'AR' ? AR_ACCOUNT : AP_ACCOUNT,
        description: `${type === 'AR' ? 'Customer' : 'Vendor'} credit memo ${creditMemoNumber}`,
        debit: 0,
        credit: totalAmount,
        referenceType: 'CREDIT_MEMO',
        referenceNumber: creditMemoNumber,
        creditMemoId: creditMemo.id,
        createdBy,
      },
      {
        date,
        accountCode: type === 'AR' ? SALES_RETURN : PURCHASE_RETURN,
        description: `${type === 'AR' ? 'Sales return' : 'Purchase return'} ${creditMemoNumber}`,
        debit: amount,
        credit: 0,
        referenceType: 'CREDIT_MEMO',
        referenceNumber: creditMemoNumber,
        creditMemoId: creditMemo.id,
        createdBy,
      },
    ];

    await Ledger.bulkCreate(ledgerEntries, { transaction: t });
    await t.commit();
    res.status(201).json(creditMemo);
  } catch (err) {
    await t.rollback();
    console.error('createCreditMemo error', err);
    next(err);
  }
};

exports.listCreditMemos = async (req, res) => {
  try {
    const creditMemos = await CreditMemo.findAll({
      order: [['date', 'DESC'], ['id', 'DESC']],
    });
    res.json(creditMemos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listSummaryByParty = async (req, res) => {
  try {
    const rows = await CreditMemo.findAll({
      attributes: [
        'partyName',
        [db.sequelize.fn('SUM', db.sequelize.col('totalAmount')), 'totalAmount'],
      ],
      group: ['partyName'],
      order: [['partyName', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};