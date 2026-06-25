const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

router.get('/', shippingController.getShippingConfigs);
router.get('/deleted', shippingController.getDeletedShippingConfigs);
router.get('/:id', shippingController.getShippingConfigById);
router.post('/', shippingController.createShippingConfig);
router.put('/:id', shippingController.updateShippingConfig);
router.delete('/:id', shippingController.softDeleteShippingConfig);
router.put('/:id/restore', shippingController.restoreShippingConfig);

module.exports = router;
