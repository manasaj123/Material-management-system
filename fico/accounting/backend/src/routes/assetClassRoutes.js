// backend/src/routes/assetClassRoutes.js
const express = require('express');
const router = express.Router();

const controller = require('../controllers/assetClassController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  controller.list
);
router.post(
  '/',
  roleMiddleware('ADMIN'),
  controller.create
);
router.put(
  '/:id',
  roleMiddleware('ADMIN'),
  controller.update
);
router.delete(
  '/:id',
  roleMiddleware('ADMIN'),
  controller.remove
);

module.exports = router;