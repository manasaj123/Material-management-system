const express = require('express');
const router = express.Router();
const controller = require('../controllers/planController');

router.get('/', controller.getByDate);
router.post('/', controller.save);
router.post('/generate', controller.generateFromForecast);

module.exports = router;
