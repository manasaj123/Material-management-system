const express = require('express');
const router = express.Router();

const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  budgetController.upsertBudget
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  budgetController.listBudgets
);

router.get(
  '/vs-actual',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  budgetController.budgetVsActual
);

module.exports = router;
