// backend/src/controllers/financialReportController.js
const db = require('../config/db');
const { Ledger } = db;
const { fn, col, Op } = db.Sequelize;

// GET /api/financial-reports/:period?type=current|ytd
exports.getFinancialReports = async (req, res) => {
  const period = req.params.period;            // "2026-04", "2026-Q1"
  const type = req.query.type || 'current';    // "current" or "ytd"

  try {
    const { periodStart, periodEnd } = getPeriodRange(period, type);

    // Group ledger by accountCode for the period
    const rows = await Ledger.findAll({
      where: {
        date: { [Op.between]: [periodStart, periodEnd] },
      },
      attributes: [
        'accountCode',
        [fn('SUM', col('debit')), 'debit'],
        [fn('SUM', col('credit')), 'credit'],
      ],
      group: ['accountCode'],
      order: [['accountCode', 'ASC']],
      raw: true,
    });

    const plData = rows
      .map((row) => {
        const gl = row.accountCode || '';
        const debit = Number(row.debit || 0);
        const credit = Number(row.credit || 0);

        // Use first digit to classify: 4* = revenue, 5* = expense
        const isRevenue = gl.startsWith('4');
        const isExpense = gl.startsWith('5');

        if (!isRevenue && !isExpense) {
          return null; // skip non-P&L codes for now
        }

        const amount = isRevenue
          ? credit - debit      // revenue: credit - debit
          : debit - credit;     // expense: debit - credit

        return {
          accountName: gl,      // later we can join to names
          accountNumber: gl,
          amount,
          type: isRevenue ? 'revenue' : 'expense',
        };
      })
      .filter(Boolean);

    const revenue = plData
      .filter((r) => r.type === 'revenue')
      .reduce((sum, r) => sum + r.amount, 0);

    const expenses = plData
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + Math.abs(r.amount), 0);

    const netProfit = revenue - expenses;

    res.json({
      pl: plData,
      bs: [],
      summary: {
        revenue,
        expenses,
        netProfit,
        assets: 0,
        liabilities: 0,
        equity: 0,
      },
    });
  } catch (err) {
    console.error('getFinancialReports error:', err);
    res.status(500).json({ message: err.message });
  }
};

// keep your existing getPeriodRange + toSqlDate (no changes)
const getPeriodRange = (period, type) => {
  if (period.includes('Q')) {
    const [yearStr, qStr] = period.split('-');
    const year = parseInt(yearStr, 10);
    const q = parseInt(qStr.replace('Q', ''), 10);

    const startMonth = (q - 1) * 3;
    const endMonth = startMonth + 2;

    const start = new Date(year, startMonth, 1);
    const end = new Date(year, endMonth + 1, 0);

    const periodStart = toSqlDate(start);
    const periodEnd =
      type === 'ytd'
        ? toSqlDate(new Date(year, 11, 31))
        : toSqlDate(end);

    return { periodStart, periodEnd };
  }

  const [yearStr, monthStr] = period.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;

  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);

  if (type === 'ytd') {
    const periodStart = toSqlDate(new Date(year, 0, 1));
    const periodEnd = toSqlDate(monthEnd);
    return { periodStart, periodEnd };
  } else {
    const periodStart = toSqlDate(monthStart);
    const periodEnd = toSqlDate(monthEnd);
    return { periodStart, periodEnd };
  }
};

const toSqlDate = (d) => d.toISOString().split('T')[0];