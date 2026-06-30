const express = require('express');
const router = express.Router();

const auditController = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get(
  '/',
  roleMiddleware('ADMIN', 'AUDITOR'),
  auditController.list
);

module.exports = router;
