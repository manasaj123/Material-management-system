import express from "express";
import { 
  getStockFIFO, 
  getStockLIFO, 
  getExpiryStatus, 
  weeklyMarket 
} from "../controllers/stockController.js";

const router = express.Router();

router.get("/fifo/:materialId", getStockFIFO);
router.get("/lifo/:materialId", getStockLIFO);
router.get("/expiry", getExpiryStatus);
router.get("/weekly", weeklyMarket);

export default router;
