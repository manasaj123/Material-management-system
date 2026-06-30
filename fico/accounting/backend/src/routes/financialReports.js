const express = require('express');
const router = express.Router();
const reportController = require('../controllers/financialReportsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get(
  '/:period',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'MANAGER'),
  reportController.getFinancialReports
);

module.exports = router;