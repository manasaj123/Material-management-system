import express from "express";
import { getStockSummary } from "../controllers/stockController.js";

const router = express.Router();

router.get("/summary", getStockSummary);

export default router;
