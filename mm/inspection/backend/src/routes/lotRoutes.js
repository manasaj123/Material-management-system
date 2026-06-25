const express = require("express");
const router = express.Router();
const lotController = require("../controllers/lotController");

router.get("/lots", lotController.getLots);
router.post("/lots", lotController.createLot);
router.put("/lots/:id/status", lotController.updateLotStatus);

module.exports = router;

