// backend/src/controllers/periodClosingController.js
const db = require('../config/db');
const { PeriodClosing } = db;

// POST /api/period-closing/close
exports.closePeriod = async (req, res, next) => {
  try {
    const { period } = req.body;

    const [closing] = await PeriodClosing.upsert(
      {
        period,
        status: 'CLOSED',
        closedBy: req.user.id,
        closedDate: new Date()
      },
      { returning: true }
    );

    res.status(201).json(closing);
  } catch (err) {
    next(err);
  }
};

// POST /api/period-closing/open
exports.openPeriod = async (req, res, next) => {
  try {
    const { period } = req.body;

    const [closing] = await PeriodClosing.upsert(
      {
        period,
        status: 'OPEN',
        closedBy: null,
        closedDate: null
      },
      { returning: true }
    );

    res.status(201).json(closing);
  } catch (err) {
    next(err);
  }
};

// GET /api/period-closing
exports.listClosings = async (req, res, next) => {
  try {
    const closings = await PeriodClosing.findAll({
      include: [
        {
          model: db.User,
          attributes: ['name'],
          as: 'ClosedByUser',
          required: false
        }
      ],
      order: [['period', 'DESC'], ['id', 'DESC']]
    });

    const rows = closings.map(c => ({
      id: c.id,
      period: c.period,
      status: c.status,
      closedByName: c.ClosedByUser ? c.ClosedByUser.name : null,
      closedDate: c.closedDate,
      depreciationRun: c.depreciationRun,
      accrualsPosted: c.accrualsPosted
    }));

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/period-closing/generate
// body: { year: 2026 }
exports.generatePeriods = async (req, res, next) => {
  try {
    const { year } = req.body;

    const periodsToCreate = [];
    for (let m = 1; m <= 12; m++) {
      const month = String(m).padStart(2, '0');
      const period = `${year}-${month}`; // e.g. "2026-01"

      periodsToCreate.push({
        period,
        status: 'OPEN'
      });
    }

    for (const p of periodsToCreate) {
      await PeriodClosing.findOrCreate({
        where: { period: p.period },
        defaults: { status: p.status }
      });
    }

    const all = await PeriodClosing.findAll({
      order: [['period', 'DESC'], ['id', 'DESC']]
    });

    res.status(201).json(all);
  } catch (err) {
    next(err);
  }
};

/**
 * Helpers for integration with Invoices / GRIR
 */

// ensure a period row exists; create as OPEN if missing
exports.ensurePeriodExists = async function ensurePeriodExists(periodStr) {
  const [row] = await PeriodClosing.findOrCreate({
    where: { period: periodStr },
    defaults: { status: 'OPEN' }
  });
  return row;
};

// throw error if period is CLOSED (used before posting)
exports.assertPeriodOpen = async function assertPeriodOpen(periodStr) {
  const row = await PeriodClosing.findOne({ where: { period: periodStr } });
  if (row && row.status === 'CLOSED') {
    const err = new Error(`Period ${periodStr} is closed. Posting not allowed.`);
    err.statusCode = 400;
    throw err;
  }
  return row;
};