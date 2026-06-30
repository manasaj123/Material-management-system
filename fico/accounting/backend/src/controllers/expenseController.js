const db = require('../config/db');
const { Expense, Ledger } = db;

const computeExpenseAmounts = ({ amount, gstRate, tdsRate }) => {
  const base = Number(amount) || 0;
  const gstR = Number(gstRate) || 0;
  const tdsR = Number(tdsRate) || 0;

  const gstAmount = base * gstR / 100;
  const tdsAmount = base * tdsR / 100;
  const totalAmount = base + gstAmount - tdsAmount;
  return { gstAmount, tdsAmount, totalAmount };
};

const postExpenseLedger = async (expense, transaction) => {
  const {
    id,
    date,
    accountCode,
    amount,
    gstAmount,
    tdsAmount,
    totalAmount,
    costCenterId,
    profitCenterId
  } = expense;

  const base = Number(amount);
  const gst = Number(gstAmount);
  const tds = Number(tdsAmount);
  const total = Number(totalAmount);

  const GST_INPUT = '110001';
  const TDS_PAYABLE = '210002';
  const BANK_OR_CASH = '100001'; // simplify

  const common = {
    date,
    referenceType: 'EXPENSE',
    referenceNumber: `EXP-${id}`,
    expenseId: id,
    costCenterId,
    profitCenterId
  };

  // Expense:
  // Debit Expense: base
  // Debit GST Input: gst
  // Credit Bank/Cash: total
  // Credit TDS Payable: tds
  await Ledger.bulkCreate([
    {
      ...common,
      accountCode,
      description: `Expense ${id}`,
      debit: base,
      credit: 0
    },
    gst > 0
      ? {
          ...common,
          accountCode: GST_INPUT,
          description: `GST input for expense ${id}`,
          debit: gst,
          credit: 0
        }
      : null,
    {
      ...common,
      accountCode: BANK_OR_CASH,
      description: `Payment for expense ${id}`,
      debit: 0,
      credit: total
    },
    tds > 0
      ? {
          ...common,
          accountCode: TDS_PAYABLE,
          description: `TDS payable for expense ${id}`,
          debit: 0,
          credit: tds
        }
      : null
  ].filter(Boolean), { transaction });
};

exports.createExpense = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      date,
      vendorName,
      description,
      accountCode,
      amount,
      gstRate,
      tdsRate,
      costCenterId,
      profitCenterId
    } = req.body;

    const { gstAmount, tdsAmount, totalAmount } = computeExpenseAmounts({
      amount,
      gstRate,
      tdsRate
    });

    const expense = await Expense.create({
      date,
      vendorName,
      description,
      accountCode,
      amount,
      gstRate,
      gstAmount,
      tdsRate,
      tdsAmount,
      totalAmount,
      costCenterId,
      profitCenterId
    }, { transaction: t });

    await postExpenseLedger(expense, t);

    await t.commit();
    res.status(201).json(expense);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.listExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
};
