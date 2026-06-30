const db = require('../config/db');
const { BankStatement, Payment } = db;

exports.importStatement = async (req, res, next) => {
  
  try {
    const { bankName, accountNumber, statementDate, rows } = req.body;

    const created = [];
    for (const r of rows) {
      const row = await BankStatement.create({
        bankName,
        accountNumber,
        statementDate,
        txnDate: r.txnDate,
        description: r.description,
        debit: r.debit || 0,
        credit: r.credit || 0,
        balance: r.balance || 0
      });
      created.push(row);
    }

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};


exports.reconcile = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { bankStatementId, paymentId } = req.body;

    const stmt = await BankStatement.findByPk(bankStatementId, { transaction: t });
    const payment = await Payment.findByPk(paymentId, { transaction: t });

    if (!stmt || !payment) {
      await t.rollback();
      return res.status(404).json({ message: 'Statement or payment not found' });
    }

    const stmtAmount = stmt.debit > 0 ? stmt.debit : stmt.credit;
    if (Number(stmtAmount) !== Number(payment.amount)) {
      await t.rollback();
      return res.status(400).json({ message: 'Amount mismatch, cannot reconcile' });
    }

    stmt.matched = true;
    stmt.matchedPaymentId = payment.id;
    await stmt.save({ transaction: t });

    payment.reconciled = true;
    await payment.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Reconciled', bankStatement: stmt, payment });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.listStatements = async (req, res, next) => {
  try {
    const stmts = await BankStatement.findAll({
      order: [['statementDate', 'DESC'], ['txnDate', 'DESC'], ['id', 'DESC']]
    });
    res.json(stmts);
  } catch (err) {
    next(err);
  }
};
