const express = require('express');
const router = express.Router();
const salesDocumentController = require('../controllers/salesDocumentController');

router.get('/', salesDocumentController.getSalesDocuments);
router.get('/deleted', salesDocumentController.getDeletedSalesDocuments);
router.get('/:id', salesDocumentController.getSalesDocumentById);
router.post('/', salesDocumentController.createSalesDocument);
router.put('/:id', salesDocumentController.updateSalesDocument);
router.delete('/:id', salesDocumentController.softDeleteSalesDocument);
router.put('/:id/restore', salesDocumentController.restoreSalesDocument);

module.exports = router;
