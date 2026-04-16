import express from "express";
import * as ctrl from "../controllers/allocation.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/run", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.runAllocation);

router.get("/current", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getCurrent);

router.get("/history", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getHistory);

router.get("/:id", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getAllocation);

router.patch("/:id/apply", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.applyAllocation);

export default router;