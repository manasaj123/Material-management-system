// backend/src/controllers/parkedInvoiceController.js
const db = require('../config/db');
const { Invoice, User, ApprovalInstance, ApprovalWorkflow } = db;

const invoiceController = require('./invoiceController');
const { postInvoiceLedger } = invoiceController;

exports.parkInvoice = async (req, res, next) => {
  try {
    console.log('>>> parkInvoice CALLED, body =', req.body);

    const { invoiceId } = req.body;

    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice || invoice.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only DRAFT invoices can be parked' });
    }

    await invoice.update({
      status: 'PARKED',
      parkedBy: req.user.id,              // or null if you don’t have auth yet
      parkedDate: new Date()
    });

    const workflow = await ApprovalWorkflow.findOne({
      where: { documentType: 'INVOICE', active: 1 }
    });

    console.log('>>> Loaded workflow:', workflow && workflow.id);

    if (!workflow) {
      console.warn('>>> No active workflow configured for INVOICE');
    } else {
      console.log('>>> Before ApprovalInstance.create, invoiceId:', invoice.id);
      const instance = await ApprovalInstance.create({
        documentId: invoice.id,
        documentType: 'INVOICE',
        amount: invoice.totalAmount,
        status: 'PENDING',
        currentLevel: 1,
        workflowId: workflow.id,
        createdBy: req.user.id            // or a fixed user id for now
      });
      console.log('>>> Created ApprovalInstance id:', instance.id);
    }

    res.json(invoice);
  } catch (err) {
    console.error('>>> parkInvoice error:', err);
    next(err);
  }
};
// GET /api/parked-invoices
exports.listParkedInvoices = async (req, res, next) => {
  try {
    const rows = await Invoice.findAll({
      where: { status: 'PARKED' },
      order: [['date', 'DESC'], ['id', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });
    res.json(rows);
  } catch (err) {
    console.error('ParkedInvoice list error:', err);
    next(err);
  }
};

// POST /api/parked-invoices/:id/approve
exports.approveInvoice = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { approvedBy, approvalDate, remarks } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice || invoice.status !== 'PARKED') {
      return res
        .status(400)
        .json({ message: 'Only PARKED invoices can be approved' });
    }

    await Invoice.update(
      {
        status: 'APPROVED',
        approvedBy,
        approvalDate,
        approvalRemarks: remarks,
      },
      { where: { id }, transaction: t }
    );

    // post to ledger using shared helper
    await postInvoiceLedger(invoice, t);

    await t.commit();
    res.json({ message: 'Invoice approved and posted' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// POST /api/parked-invoices/:id/reject
exports.rejectInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    await Invoice.update(
      {
        status: 'REJECTED',
        approvalRemarks: 'Rejected by ' + req.user.name,
      },
      { where: { id } }
    );

    res.json({ message: 'Invoice rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};