import express from "express";
import {
  getPRs,
  createPR,
  getPRById,
  updatePR,
  deletePR
} from "../controllers/prController.js";

const router = express.Router();

// /api/pr  → list + create
router.get("/", getPRs);
router.post("/", createPR);

// /api/pr/:id → get one, update, delete
router.get("/:id", getPRById);
router.put("/:id", updatePR);
router.delete("/:id", deletePR);

export default router;
