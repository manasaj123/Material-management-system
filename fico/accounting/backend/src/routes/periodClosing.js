// backend/src/routes/periodClosingRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/periodClosingController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth);

router.get(
  '/',
  role('ADMIN', 'ACCOUNTANT'),
  controller.listClosings
);

router.post(
  '/close',
  role('ADMIN', 'ACCOUNTANT'),
  controller.closePeriod
);

router.post(
  '/open',
  role('ADMIN', 'ACCOUNTANT'),
  controller.openPeriod
);

// optional: generate 12 periods for a year
router.post(
  '/generate',
  role('ADMIN', 'ACCOUNTANT'),
  controller.generatePeriods
);

// optional placeholders
router.post(
  '/depreciation',
  role('ADMIN', 'ACCOUNTANT'),
  (req, res) => res.sendStatus(204)
);

router.post(
  '/accruals',
  role('ADMIN', 'ACCOUNTANT'),
  (req, res) => res.sendStatus(204)
);

module.exports = router;