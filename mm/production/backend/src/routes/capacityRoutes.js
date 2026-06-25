const express = require('express');
const router = express.Router();
const controller = require('../controllers/capacityController');

router.get('/', controller.getByDate);
router.post('/', controller.save);
router.post('/suggest', controller.suggest);

module.exports = router;
