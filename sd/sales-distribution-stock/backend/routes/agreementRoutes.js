const express = require('express');
const router = express.Router();
const agreementController = require('../controllers/agreementController');

router.get('/', agreementController.getAgreements);
router.get('/deleted', agreementController.getDeletedAgreements);
router.get('/:id', agreementController.getAgreementById);
router.post('/', agreementController.createAgreement);
router.put('/:id', agreementController.updateAgreement);
router.delete('/:id', agreementController.softDeleteAgreement);
router.put('/:id/restore', agreementController.restoreAgreement);

module.exports = router;
