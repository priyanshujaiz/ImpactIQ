import { db } from "../db/index.js";
import { fieldReports, zones } from "../db/schema.js";
import { eq } from "drizzle-orm";

import { parseFieldReport } from "./gemini.service.js";
import { scoreZones } from "./engine.service.js";
import { runAlertCheck } from "./alert.service.js";

const sanitizeZone = (z) => ({
  id: z.id,
  zoneId: z.zoneId ?? z.id,
  name: z.name ?? "Unknown Zone",
  lat: parseFloat(z.lat) || 0,
  lng: parseFloat(z.lng) || 0,
  urgency: parseInt(z.urgency) || 1,
  severity: parseInt(z.severity) || 1,
  peopleAffected: parseInt(z.peopleAffected) || 0,
  needType: Array.isArray(z.needType) ? z.needType : [],
  needScore: parseFloat(z.needScore) || 0,
  currentVolunteers: parseInt(z.currentVolunteers) || 0,
  trendDelta: parseFloat(z.trendDelta) || 0,
  status: z.status ?? "active",
});

export const ingestReport = async (rawText, userId) => {
  try {
    let extracted;
    try {
      extracted = await parseFieldReport(rawText);
    } catch (err) {
      console.error("Gemini parsing failed:", err.message);
      throw new Error("Failed to parse report");
    }

    const { zone_id, need_type, urgency, people_affected, severity, current_volunteers } = extracted;

    if (!zone_id) throw new Error("Zone ID missing from parsed data");

    let zoneRecord;
    try {
      const existing = await db.select().from(zones).where(eq(zones.zoneId, zone_id));
      zoneRecord = existing[0];
    } catch (err) {
      console.error("DB fetch zone error:", err.message);
      throw new Error("Database error while fetching zone");
    }

    try {
      if (!zoneRecord) {
        const [newZone] = await db
          .insert(zones)
          .values({
            zoneId: zone_id,
            name: zone_id,
            lat: 0,
            lng: 0,
            urgency,
            severity,
            peopleAffected: people_affected,
            needType: need_type,
            currentVolunteers: current_volunteers || 0,
          })
          .returning();
        zoneRecord = newZone;
      } else {
        const [updated] = await db
          .update(zones)
          .set({
            urgency,
            severity,
            peopleAffected: people_affected,
            needType: need_type,
            currentVolunteers: current_volunteers || 0,
          })
          .where(eq(zones.id, zoneRecord.id))
          .returning();
        zoneRecord = updated;
      }
    } catch (err) {
      console.error("Zone upsert error:", err.message);
      throw new Error("Failed to update zone");
    }

    let report;
    try {
      const [saved] = await db
        .insert(fieldReports)
        .values({
          rawText,
          extractedData: extracted,
          zoneId: zoneRecord.id,
          submittedBy: userId,
          status: "processed",
          geminiConfidence: 1,
        })
        .returning();
      report = saved;
    } catch (err) {
      console.error("Report save error:", err.message);
      throw new Error("Failed to save report");
    }

    try {
      const allZones = await db.select().from(zones);

      const safeZones = allZones
        .filter((z) => z.lat != null && z.lng != null && z.urgency != null)
        .map(sanitizeZone);

      const scored = await scoreZones(safeZones);

      for (const z of scored) {
        await db
          .update(zones)
          .set({ needScore: z.need_score })
          .where(eq(zones.id, z.id));
      }

      try {
        await runAlertCheck();
      } catch (alertErr) {
        console.error("Alert check failed:", alertErr.message);
      }
    } catch (err) {
      console.error("Zone scoring failed:", err.message);
    }

    return { message: "Report processed successfully", zone: zoneRecord, report };
  } catch (err) {
    console.error("Ingest pipeline failed:", err.message);
    throw err;
  }
};

export const getReports = async () => {
  try {
    return await db.select().from(fieldReports);
  } catch (err) {
    console.error("Fetch reports error:", err.message);
    throw err;
  }
};

export const getReportById = async (id) => {
  try {
    const result = await db.select().from(fieldReports).where(eq(fieldReports.id, id));
    return result[0];
  } catch (err) {
    console.error("Fetch report error:", err.message);
    throw err;
  }
};

export const deleteReport = async (id) => {
  try {
    const [deleted] = await db.delete(fieldReports).where(eq(fieldReports.id, id)).returning();
    return deleted;
  } catch (err) {
    console.error("Delete report error:", err.message);
    throw err;
  }
};