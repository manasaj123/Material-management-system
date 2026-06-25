import express from "express";
import {
  createGRN,
  getGRNs,
  getGRNById,
  updateGRN,
  deleteGRN
} from "../controllers/grnController.js";

const router = express.Router();

router.get("/", getGRNs);
router.get("/:id", getGRNById);
router.post("/", createGRN);
router.put("/:id", updateGRN);
router.delete("/:id", deleteGRN);

export default router;
