import express from "express";
import * as ctrl from "../controllers/volunteer.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// CRUD
router.post("/", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.createVolunteer);
router.get("/", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getVolunteers);
router.get("/available", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getAvailable);
router.get("/:id", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.getVolunteer);
router.put("/:id", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.updateVolunteer);
router.delete("/:id", protect, authorizeRoles("ADMIN"), ctrl.deleteVolunteer);

// operational
router.patch("/:id/location", protect, ctrl.updateLocation);
router.patch("/:id/availability", protect, ctrl.updateAvailability);

router.patch("/:id/assign", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.assignVolunteer);
router.patch("/:id/unassign", protect, authorizeRoles("ADMIN", "COORDINATOR"), ctrl.unassignVolunteer);

router.get("/:id/history", protect, ctrl.getHistory);

export default router;