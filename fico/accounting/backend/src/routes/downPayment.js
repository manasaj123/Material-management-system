// src/routes/downPayment.js
const express = require('express');
const router = express.Router();

const downPaymentController = require('../controllers/downPaymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  downPaymentController.createDownPayment
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'VIEWER'),
  downPaymentController.listDownPayments
);

router.get(
  '/open',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  downPaymentController.listOpenDownPayments
);

router.get(
  '/open/party/:partyId',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  downPaymentController.listOpenDownPaymentsByParty
);

module.exports = router;