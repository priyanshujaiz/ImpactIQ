import express from "express";
import * as ctrl from "../controllers/metrics.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/summary", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getSummary);

router.get("/zones", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getZones);

router.get("/history", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getHistory);

export default router;