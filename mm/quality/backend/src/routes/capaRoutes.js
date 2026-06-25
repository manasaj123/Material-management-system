// backend/src/routes/capaRoutes.js
import express from "express";
import {
  listCAPA,
  createCAPA,
  updateCAPAStatus
} from "../controllers/capaController.js";

const router = express.Router();

router.get("/", listCAPA);
router.post("/", createCAPA);
router.patch("/:id/status", updateCAPAStatus);

export default router;
