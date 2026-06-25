const express = require("express");
const { 
  salesByCustomer, 
  salesByRegion,
  salesSummary 
} = require("../controllers/reportController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/customer", authMiddleware, salesByCustomer);
router.get("/region", authMiddleware, salesByRegion);
router.get("/summary", authMiddleware, salesSummary);

module.exports = router;