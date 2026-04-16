import { db } from "../db/index.js";
import { alerts, zones } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

import { generateAlerts } from "./gemini.service.js";

export const runAlertCheck = async () => {
  try {
    const allZones = await db.select().from(zones).where(eq(zones.status, "active"));

    const generatedAlerts = [];

    for (const z of allZones) {
      let type = null;

      if ((z.currentVolunteers ?? 0) === 0) {
        type = "critical";
      } else if (z.urgency >= 8 || (z.needScore ?? 0) > 50) {
        type = "critical";
      } else if ((z.currentVolunteers ?? 0) < 2) {
        type = "warning";
      } else {
        continue;
      }

      const existing = await db
        .select()
        .from(alerts)
        .where(and(eq(alerts.zoneId, z.id), eq(alerts.type, type), eq(alerts.status, "active")));

      if (existing.length) continue;

      let message = "Attention required";
      let suggestedAction = "Review zone";

      try {
        const ai = await generateAlerts({ zone: z, type });
        if (ai.alerts && ai.alerts.length > 0) {
          message = ai.alerts[0].message;
          suggestedAction = ai.alerts[0].suggested_action;
        }
      } catch (err) {
        console.error("Gemini alert generation failed:", err.message);
      }

      const [saved] = await db
        .insert(alerts)
        .values({ zoneId: z.id, type, message, suggestedAction, status: "active" })
        .returning();

      generatedAlerts.push(saved);
    }

    console.log(`Alert check complete — ${generatedAlerts.length} new alert(s)`);
    return generatedAlerts;
  } catch (err) {
    console.error("Alert check failed:", err.message);
  }
};

export const getAlerts = async () => {
  return await db.select().from(alerts);
};

export const getActiveAlerts = async () => {
  return await db.select().from(alerts).where(eq(alerts.status, "active"));
};

export const resolveAlert = async (id) => {
  const [updated] = await db
    .update(alerts)
    .set({ status: "resolved" })
    .where(eq(alerts.id, id))
    .returning();
  return updated;
};