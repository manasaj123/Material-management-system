const express = require('express');
const router = express.Router();
const customerGroupController = require('../controllers/customerGroupController');

router.get('/', customerGroupController.getCustomerGroups);
router.get('/deleted', customerGroupController.getDeletedCustomerGroups);
router.get('/:id', customerGroupController.getCustomerGroupById);
router.post('/', customerGroupController.createCustomerGroup);
router.put('/:id', customerGroupController.updateCustomerGroup);
router.delete('/:id', customerGroupController.softDeleteCustomerGroup);
router.put('/:id/restore', customerGroupController.restoreCustomerGroup);

module.exports = router;
