import express from "express";
import * as ctrl from "../controllers/simulation.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.runSimulation);

router.get("/", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getSimulations);

router.get("/:id", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getSimulation);

router.delete("/:id", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.deleteSimulation);

export default router;