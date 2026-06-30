const express = require('express');
const router = express.Router();

const costCenterController = require('../controllers/costCenterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware('ADMIN'),
  costCenterController.create
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  costCenterController.list
);

module.exports = router;
