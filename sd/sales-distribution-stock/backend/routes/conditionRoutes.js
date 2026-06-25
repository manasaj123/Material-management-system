const express = require('express');
const router = express.Router();
const conditionController = require('../controllers/conditionController');

router.get('/', conditionController.getConditions);
router.get('/deleted', conditionController.getDeletedConditions);
router.get('/:id', conditionController.getConditionById);
router.post('/', conditionController.createCondition);
router.put('/:id', conditionController.updateCondition);
router.delete('/:id', conditionController.softDeleteCondition);
router.put('/:id/restore', conditionController.restoreCondition);

module.exports = router;
