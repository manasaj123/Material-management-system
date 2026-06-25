const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesOrderController');

router.get('/', salesOrderController.getSalesOrders);
router.get('/deleted', salesOrderController.getDeletedSalesOrders);
router.get('/:id', salesOrderController.getSalesOrderById);
router.post('/', salesOrderController.createSalesOrder);
router.put('/:id', salesOrderController.updateSalesOrder);
router.delete('/:id', salesOrderController.softDeleteSalesOrder);
router.put('/:id/restore', salesOrderController.restoreSalesOrder);

module.exports = router;
