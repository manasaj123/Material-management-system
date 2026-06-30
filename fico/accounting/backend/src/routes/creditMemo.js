// backend/src/routes/creditMemo.js
const express = require('express');
const router = express.Router();

const creditMemoController = require('../controllers/creditMemoController');

// Simple auth stub (or use your real middlewares)
const authMiddleware = (req, res, next) => {
  req.user = { id: 1, username: 'admin' };
  next();
};
const roleMiddleware = (...roles) => (req, res, next) => next();

// CREATE
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  creditMemoController.createCreditMemo
);

// LIST ALL
router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'VIEWER'),
  creditMemoController.listCreditMemos
);

// OPTIONAL: SUMMARY BY PARTY
router.get(
  '/summary-by-party',
  authMiddleware,
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'VIEWER'),
  creditMemoController.listSummaryByParty
);

module.exports = router;