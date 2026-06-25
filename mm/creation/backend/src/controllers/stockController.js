import { StockLedger } from "../models/StockLedger.js";

export const getStockSummary = async (req, res, next) => {
  try {
    const [rows] = await StockLedger.getStockSummary();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
