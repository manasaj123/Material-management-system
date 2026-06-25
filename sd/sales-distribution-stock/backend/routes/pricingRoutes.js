const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

router.get('/', pricingController.getPricingConfigs);
router.get('/deleted', pricingController.getDeletedPricingConfigs);
router.get('/:id', pricingController.getPricingConfigById);
router.post('/', pricingController.createPricingConfig);
router.put('/:id', pricingController.updatePricingConfig);
router.delete('/:id', pricingController.softDeletePricingConfig);
router.put('/:id/restore', pricingController.restorePricingConfig);

module.exports = router;
