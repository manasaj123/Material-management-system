const express = require('express');
const router = express.Router();
const controller = require('../controllers/batchController');

router.get('/', controller.getByDate);
router.post('/', controller.createMany);

module.exports = router;
