const express = require('express');
const router = express.Router();
const controller = require('../controllers/workOrderController');

router.get('/', controller.getByDate);
router.post('/', controller.create);
router.put('/:id/actuals', controller.updateActuals);

module.exports = router;
