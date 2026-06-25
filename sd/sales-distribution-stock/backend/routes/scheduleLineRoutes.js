const express = require('express');
const router = express.Router();
const scheduleLineController = require('../controllers/scheduleLineController');

router.get('/', scheduleLineController.getScheduleLines);
router.get('/deleted', scheduleLineController.getDeletedScheduleLines);
router.get('/:id', scheduleLineController.getScheduleLineById);
router.post('/', scheduleLineController.createScheduleLine);
router.put('/:id', scheduleLineController.updateScheduleLine);
router.delete('/:id', scheduleLineController.softDeleteScheduleLine);
router.put('/:id/restore', scheduleLineController.restoreScheduleLine);

module.exports = router;
