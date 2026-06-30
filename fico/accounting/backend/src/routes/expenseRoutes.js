const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  auditMiddleware('CREATE_EXPENSE'),
  expenseController.createExpense
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  expenseController.listExpenses
);

module.exports = router;
