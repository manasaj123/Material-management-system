const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

router.get('/', materialController.getMaterials);
router.get('/deleted', materialController.getDeletedMaterials);
router.get('/:id', materialController.getMaterialById);
router.post('/', materialController.createMaterial);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.softDeleteMaterial);
router.put('/:id/restore', materialController.restoreMaterial);

module.exports = router;
