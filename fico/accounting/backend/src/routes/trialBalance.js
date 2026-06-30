// backend/src/routes/trialBalanceRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/trialBalanceController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth);

router.get(
  '/:period',
  role('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'VIEWER'),
  controller.getTrialBalanceByPeriod
);

module.exports = router;