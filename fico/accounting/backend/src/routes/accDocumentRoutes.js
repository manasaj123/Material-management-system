// backend/src/routes/accDocumentRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/accDocumentController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth);

router.get('/', role('ADMIN', 'ACCOUNTANT'), controller.list);
router.get('/search', role('ADMIN', 'ACCOUNTANT'), controller.search);
router.post('/', role('ADMIN', 'ACCOUNTANT'), controller.create);

module.exports = router;