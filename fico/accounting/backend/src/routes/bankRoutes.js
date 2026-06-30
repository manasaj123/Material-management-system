const express = require('express');
const router = express.Router();

const bankController = require('../controllers/bankController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.use(authMiddleware);

router.post(
  '/import',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  auditMiddleware('IMPORT_BANK_STATEMENT'),
  bankController.importStatement
);

router.post(
  '/reconcile',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  auditMiddleware('RECONCILE_BANK'),
  bankController.reconcile
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  bankController.listStatements
);

module.exports = router;
