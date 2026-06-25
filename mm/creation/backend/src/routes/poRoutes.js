import express from "express";
import {
  getPOs,
  getPOById,
  createPO,
  updatePO,
  deletePO
} from "../controllers/poController.js";

const router = express.Router();

router.get("/", getPOs);
router.get("/:id", getPOById);
router.post("/", createPO);
router.put("/:id", updatePO);     // ✅ for edit
router.delete("/:id", deletePO);

export default router;
