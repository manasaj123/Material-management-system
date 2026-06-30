// backend/src/routes/parkedInvoice.js
const express = require('express');
const router = express.Router();

const parkedInvoiceController = require('../controllers/parkedInvoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Park an invoice (from DRAFT → PARKED)
router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  parkedInvoiceController.parkInvoice
);

// List all PARKED invoices
router.get(
  '/',
  roleMiddleware('ADMIN', 'MANAGER', 'AUDITOR'),
  parkedInvoiceController.listParkedInvoices
);

// Approve and post a parked invoice
router.post(
  '/:id/approve',
  roleMiddleware('MANAGER', 'ADMIN'),
  parkedInvoiceController.approveInvoice
);

// Reject a parked invoice
router.post(
  '/:id/reject',
  roleMiddleware('MANAGER', 'ADMIN'),
  parkedInvoiceController.rejectInvoice
);

module.exports = router;