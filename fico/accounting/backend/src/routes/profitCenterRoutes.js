const express = require('express');
const router = express.Router();

const profitCenterController = require('../controllers/profitCenterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware('ADMIN'),
  profitCenterController.create
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  profitCenterController.list
);

module.exports = router;
