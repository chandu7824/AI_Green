import express from "express";
import {
  gridMix,
  analyzeAI,
  getEmission,
  analyzeEmission,
} from "../controllers/emission.controller.js";
import { verifyToken } from "../middleware/verifyMiddleware.js";

const router = express.Router();

router.post("/grid-mix", gridMix);
router.post("/ai", verifyToken, analyzeAI);
router.get("/emission", verifyToken, getEmission);
router.post("/analyze-emission", verifyToken, analyzeEmission);

export default router;
