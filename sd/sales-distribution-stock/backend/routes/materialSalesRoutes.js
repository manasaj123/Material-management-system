const express = require('express');
const router = express.Router();
const materialSalesController = require('../controllers/materialSalesController');

router.get('/', materialSalesController.getSalesViews);
router.get('/deleted', materialSalesController.getDeletedSalesViews);
router.get('/:id', materialSalesController.getSalesViewById);
router.post('/', materialSalesController.createSalesView);
router.put('/:id', materialSalesController.updateSalesView);
router.delete('/:id', materialSalesController.softDeleteSalesView);
router.put('/:id/restore', materialSalesController.restoreSalesView);

module.exports = router;
