import express from "express";
import * as ctrl from "../controllers/alert.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/poll", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.pollAlerts);

router.get("/", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getAlerts);

router.get("/active", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getActive);

router.patch("/:id/resolve", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.resolveAlert);

export default router;