const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  auditMiddleware('CREATE_PAYMENT'),
  paymentController.createPayment
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  paymentController.listPayments
);


router.get(
  '/for-invoice/:invoiceId',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'VIEWER'),
  paymentController.listPaymentsForInvoice
);

module.exports = router;
