// backend/src/routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/journalController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth);

// list headers
router.get('/', role('ADMIN', 'ACCOUNTANT'), controller.list);

// create journal
router.post('/', role('ADMIN', 'ACCOUNTANT'), controller.create);

// get lines for one journal
router.get('/:id/lines', role('ADMIN', 'ACCOUNTANT'), controller.lines);

module.exports = router;