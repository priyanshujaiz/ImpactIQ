import { db } from "../db/index.js";
import { zones, volunteers, alerts, allocations } from "../db/schema.js";

// 📊 SUMMARY
export const getSummary = async () => {
  try {
    const allZones = await db.select().from(zones);
    const allVolunteers = await db.select().from(volunteers);
    const allAlerts = await db.select().from(alerts);
    const allAllocations = await db.select().from(allocations);

    const totalZones = allZones.length;
    const totalVolunteers = allVolunteers.length;

    const activeAlerts = allAlerts.filter(a => a.status === "active").length;

    const avgNeedScore =
      totalZones === 0
        ? 0
        : allZones.reduce((sum, z) => sum + (z.needScore || 0), 0) / totalZones;

    // latest allocation
    let latestImpact = 0;
    let maxImpact = 0;

    if (allAllocations.length > 0) {
      const sorted = allAllocations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      latestImpact = sorted[0].totalImpactScore || 0;

      maxImpact = Math.max(...allAllocations.map(a => a.totalImpactScore || 0));
    }

    const allocationEfficiency =
      maxImpact === 0 ? 0 : (latestImpact / maxImpact) * 100;

    return {
      totalZones,
      totalVolunteers,
      activeAlerts,
      avgNeedScore: Number(avgNeedScore.toFixed(2)),
      totalImpact: latestImpact,
      allocationEfficiency: Number(allocationEfficiency.toFixed(2)),
    };
  } catch (err) {
    console.error("❌ Metrics summary failed:", err.message);
    throw err;
  }
};

// 📍 ZONE METRICS
export const getZoneMetrics = async () => {
  try {
    const allZones = await db.select().from(zones);

    return allZones.map((z) => {
      let status = "stable";

      if (z.urgency >= 8) status = "critical";
      else if (z.urgency >= 5) status = "warning";

      return {
        id: z.id,
        zoneId: z.zoneId,
        urgency: z.urgency,
        needScore: z.needScore,
        currentVolunteers: z.currentVolunteers,
        status,
      };
    });
  } catch (err) {
    console.error("❌ Zone metrics failed:", err.message);
    throw err;
  }
};

// 📈 IMPACT HISTORY
export const getImpactHistory = async () => {
  try {
    const allAllocations = await db.select().from(allocations);

    return allAllocations
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((a) => ({
        timestamp: a.createdAt,
        impact: a.totalImpactScore,
      }));
  } catch (err) {
    console.error("❌ Impact history failed:", err.message);
    throw err;
  }
};