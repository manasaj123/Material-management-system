const express = require('express');
const router = express.Router();
const grirController = require('../controllers/grirClearingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  grirController.createGrirEntry
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  grirController.listGrirEntries
);

module.exports = router;