const express = require('express');
const router = express.Router();
const pickingController = require('../controllers/pickingController');

router.get('/', pickingController.getPickings);
router.get('/deleted', pickingController.getDeletedPickings);
router.get('/:id', pickingController.getPickingById);
router.post('/', pickingController.createPicking);
router.put('/:id', pickingController.updatePicking);
router.delete('/:id', pickingController.softDeletePicking);
router.put('/:id/restore', pickingController.restorePicking);

module.exports = router;
