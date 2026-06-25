const express = require('express');
const router = express.Router();
const controller = require('../controllers/forecastController');

router.get('/', controller.getByPeriod);
router.post('/', controller.save);

module.exports = router;
