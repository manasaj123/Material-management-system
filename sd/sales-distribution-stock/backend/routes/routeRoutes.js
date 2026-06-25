const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

router.get('/', routeController.getRoutes);
router.get('/deleted', routeController.getDeletedRoutes);
router.get('/:id', routeController.getRouteById);
router.post('/', routeController.createRoute);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.softDeleteRoute);
router.put('/:id/restore', routeController.restoreRoute);

module.exports = router;
