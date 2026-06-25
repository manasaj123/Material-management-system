const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');

router.get('/', creditController.getCredits);
router.get('/deleted', creditController.getDeletedCredits);
router.get('/:id', creditController.getCreditById);
router.post('/', creditController.createCredit);
router.put('/:id', creditController.updateCredit);
router.delete('/:id', creditController.softDeleteCredit);
router.put('/:id/restore', creditController.restoreCredit);

module.exports = router;
