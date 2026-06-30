const db = require('../config/db');
const { Payment, Invoice, Ledger } = db;

// -------- helper: generate next payment number --------
const generatePaymentNumber = async () => {
  let last = await Payment.findOne({
    order: [['id', 'DESC']]
  });

  let nextSeq = 1;

  if (last && last.paymentNumber) {
    const parts = String(last.paymentNumber).split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);

    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  let newNumber;

  // 🔥 LOOP UNTIL UNIQUE (fixes ALL duplicates safely)
  while (true) {
    newNumber = `DB4-PAY-${String(nextSeq).padStart(3, '0')}`;

    const exists = await Payment.findOne({
      where: { paymentNumber: newNumber }
    });

    if (!exists) break;

    nextSeq++;
  }

  return newNumber;
};

// -------- helper: post ledger --------
const postPaymentLedger = async (payment, invoice, transaction) => {
  const {
    id,
    paymentNumber,
    type,
    date,
    mode,
    bankAccountCode,
    amount,
    tdsAmount
  } = payment;

  const isReceipt = type === 'RECEIPT';

  // GL assumptions
  const AR_ACCOUNT = '300001';
  const AP_ACCOUNT = '200001';
  const BANK_OR_CASH = bankAccountCode;
  const TDS_RECEIVABLE = '310001';
  const TDS_PAYABLE = '210002';

  const amt = Number(amount);
  const tds = Number(tdsAmount) || 0;

  const common = {
    date,
    referenceType: type, // use actual type
    referenceNumber: paymentNumber,
    paymentId: id,
    invoiceId: invoice.id,
    costCenterId: invoice.costCenterId,
    profitCenterId: invoice.profitCenterId
  };

  if (isReceipt) {
    // Customer receipt:
    // Debit Bank/Cash: amt
    // Credit AR: amt + tds
    // Debit TDS Receivable: tds
    await Ledger.bulkCreate(
      [
        {
          ...common,
          accountCode: BANK_OR_CASH,
          description: `Receipt for invoice ${invoice.invoiceNumber}`,
          debit: amt,
          credit: 0
        },
        {
          ...common,
          accountCode: AR_ACCOUNT,
          description: `Clear AR for invoice ${invoice.invoiceNumber}`,
          debit: 0,
          credit: amt + tds
        },
        tds > 0
          ? {
              ...common,
              accountCode: TDS_RECEIVABLE,
              description: `TDS receivable on payment ${paymentNumber}`,
              debit: tds,
              credit: 0
            }
          : null
      ].filter(Boolean),
      { transaction }
    );
  } else {
    // Vendor payment:
    // Debit AP: amt + tds
    // Credit Bank/Cash: amt
    // Credit TDS Payable: tds
    await Ledger.bulkCreate(
      [
        {
          ...common,
          accountCode: AP_ACCOUNT,
          description: `Clear AP for invoice ${invoice.invoiceNumber}`,
          debit: amt + tds,
          credit: 0
        },
        {
          ...common,
          accountCode: BANK_OR_CASH,
          description: `Payment for invoice ${invoice.invoiceNumber}`,
          debit: 0,
          credit: amt
        },
        tds > 0
          ? {
              ...common,
              accountCode: TDS_PAYABLE,
              description: `TDS payable on payment ${paymentNumber}`,
              debit: 0,
              credit: tds
            }
          : null
      ].filter(Boolean),
      { transaction }
    );
  }
};

// -------- controller: createPayment --------
exports.createPayment = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    // IMPORTANT: do NOT destructure paymentNumber from body
    const {
      type,
      invoiceId,
      date,
      mode,
      bankAccountCode,
      amount,
      tdsAmount,
      referenceNumber,
      remarks
    } = req.body;

    const invoice = await Invoice.findByPk(invoiceId, { transaction: t });
    if (!invoice) {
      await t.rollback();
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const payAmt = Number(amount);
    if (payAmt <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    if (payAmt > Number(invoice.balanceAmount)) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: 'Payment exceeds invoice balance' });
    }

    // generate payment number on backend
    const newPaymentNumber = await generatePaymentNumber();

    const refNo =
      referenceNumber && referenceNumber.trim()
        ? referenceNumber.trim()
        : newPaymentNumber;

    const payment = await Payment.create(
      {
        paymentNumber: newPaymentNumber,
        type,
        invoiceId,
        date,
        mode,
        bankAccountCode,
        amount: payAmt,
        tdsAmount: tdsAmount || 0,
        referenceNumber: refNo,
        remarks
      },
      { transaction: t }
    );

    // Update invoice balance & status
    const newBalance = Number(invoice.balanceAmount) - payAmt;
    invoice.balanceAmount = newBalance;
    if (newBalance === 0) {
      invoice.status = 'PAID';
    } else {
      invoice.status = 'PARTLY_PAID';
    }
    await invoice.save({ transaction: t });

    await postPaymentLedger(payment, invoice, t);

    await t.commit();
    res.status(201).json(payment);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// -------- controller: listPayments --------
exports.listPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
    
    res.json(payments);
  } catch (err) {
    next(err);
  }
};


// in paymentController.js
exports.markReconciled = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.reconciled = true;
    await payment.save();

    res.json(payment);
  } catch (err) {
    next(err);
  }
};


// paymentController.js
exports.listPaymentsForInvoice = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const payments = await Payment.findAll({
      where: { invoiceId },           // no extra filter
      order: [['date', 'DESC'], ['id', 'DESC']],
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};