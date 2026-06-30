// backend/src/routes/ledgerRoutes.js
const express = require('express');
const router = express.Router();

const ledgerController = require('../controllers/ledgerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  ledgerController.listJournals
);

router.get(
  '/:id',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  ledgerController.getJournal
);

router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  ledgerController.createJournal
);

router.put(
  '/:id/hold-toggle',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  ledgerController.toggleHold
);

module.exports = router;