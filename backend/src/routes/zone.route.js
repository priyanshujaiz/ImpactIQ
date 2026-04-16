import express from "express";
import * as zoneController from "../controllers/zone.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post(
  "/recompute-score",
  protect,
  authorizeRoles("ADMIN", "COORDINATOR"),
  zoneController.recomputeScores
);


router.post("/", protect, authorizeRoles("ADMIN"), zoneController.createZone);

router.get(
  "/",
  protect,
  authorizeRoles("ADMIN", "COORDINATOR"),
  zoneController.getZones
);

router.get(
  "/:id",
  protect,
  authorizeRoles("ADMIN", "COORDINATOR"),
  zoneController.getZone
);

router.put(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  zoneController.updateZone
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  zoneController.deleteZone
);

router.get(
  "/:id/volunteers",
  protect,
  authorizeRoles("ADMIN", "COORDINATOR"),
  zoneController.getZoneVolunteers
);

router.get(
  "/:id/history",
  protect,
  authorizeRoles("ADMIN", "COORDINATOR"),
  zoneController.getZoneHistory
);

export default router;