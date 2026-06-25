const express = require('express');
const router = express.Router();
const itemCategoriesController = require('../controllers/itemCategoriesController');

router.get('/', itemCategoriesController.getItemCategoriesConfigs);
router.get('/deleted', itemCategoriesController.getDeletedItemCategoriesConfigs);
router.get('/:id', itemCategoriesController.getItemCategoriesConfigById);
router.post('/', itemCategoriesController.createItemCategoriesConfig);
router.put('/:id', itemCategoriesController.updateItemCategoriesConfig);
router.delete('/:id', itemCategoriesController.softDeleteItemCategoriesConfig);
router.put('/:id/restore', itemCategoriesController.restoreItemCategoriesConfig);

module.exports = router;
