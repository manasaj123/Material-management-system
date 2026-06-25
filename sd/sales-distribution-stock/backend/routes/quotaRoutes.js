const express = require('express');
const router = express.Router();
const quotaController = require('../controllers/quotaController');

router.get('/', quotaController.getQuotas);
router.get('/deleted', quotaController.getDeletedQuotas);
router.get('/:id', quotaController.getQuotaById);
router.post('/', quotaController.createQuota);
router.put('/:id', quotaController.updateQuota);
router.delete('/:id', quotaController.softDeleteQuota);
router.put('/:id/restore', quotaController.restoreQuota);

module.exports = router;
