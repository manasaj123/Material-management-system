// backend/src/routes/glAccountRoutes.js
const express = require('express');
const router = express.Router();

const glAccountController = require('../controllers/glAccountController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  glAccountController.list
);

router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  glAccountController.create
);

router.put(
  '/:id',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  glAccountController.update
);

router.delete(
  '/:id',
  roleMiddleware('ADMIN'),
  glAccountController.remove
);

module.exports = router;