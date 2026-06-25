const express = require("express");
const {
  createDelivery,
  updateDelivery,
  updateDeliveryStatus,
  getDeliveries,
  getOrdersWithoutDelivery
} = require("../controllers/deliveryController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createDelivery);
router.put("/:id", authMiddleware, updateDelivery);
router.patch("/:id/status", authMiddleware, updateDeliveryStatus);
router.get("/", authMiddleware, getDeliveries);
router.get("/available-orders", authMiddleware, getOrdersWithoutDelivery);

module.exports = router;