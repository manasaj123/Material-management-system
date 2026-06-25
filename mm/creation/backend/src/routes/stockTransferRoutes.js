import express from "express";
import { createStockTransfer } from "../controllers/stockTransferController.js";

const router = express.Router();

router.post("/", createStockTransfer);

export default router;
