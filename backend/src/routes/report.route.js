import express from "express";
import * as ctrl from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/ingest", protect, ctrl.ingestReport);

router.get("/", protect, ctrl.getReports);
router.get("/:id", protect, ctrl.getReport);

router.delete("/:id", protect, ctrl.deleteReport);

export default router;