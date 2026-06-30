// src/routes/clearing.js
const express = require('express');
const router = express.Router();

const clearingController = require('../controllers/clearingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  clearingController.createClearing
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  clearingController.listClearings
);

router.get(
  '/open-invoices',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  clearingController.getOpenInvoices
);


router.get(
  '/open',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'VIEWER'),
  clearingController.getOpenInvoices
);
module.exports = router;