const express = require('express');
const router = express.Router();
const controller = require('../controllers/metricController');

router.get('/daily', controller.daily);

module.exports = router;
