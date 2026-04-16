import { db } from "../db/index.js";
import { zones, volunteers, allocations } from "../db/schema.js";
import { eq } from "drizzle-orm";

import { optimizeAllocation } from "./engine.service.js";
import { generateExplanation } from "./gemini.service.js";

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

const sanitizeVolunteer = (v) => ({
  id: v.id,
  name: v.name ?? "Unknown Volunteer",
  skills: Array.isArray(v.skills) ? v.skills : [],
  lat: parseFloat(v.lat) || 0,
  lng: parseFloat(v.lng) || 0,
  availability: v.availability ?? "available",
  reliabilityScore: parseFloat(v.reliabilityScore) || 0.8,
  currentZoneId: v.currentZoneId ?? null,
  status: v.status ?? "active",
});

export const runAllocation = async () => {
  try {
    const allZones = await db.select().from(zones);
    if (!allZones.length) throw new Error("No zones available");

    const allVolunteers = await db.select().from(volunteers);
    if (!allVolunteers.length) throw new Error("No volunteers available");

    const safeZones = allZones
      .filter((z) => z.status === "active" && z.lat != null && z.lng != null && z.urgency != null)
      .map(sanitizeZone);

    if (!safeZones.length) throw new Error("No valid zones with coordinates");

    const safeVolunteers = allVolunteers
      .filter((v) => v.status === "active" && v.availability !== "offline" && v.lat != null && v.lng != null)
      .map(sanitizeVolunteer);

    if (!safeVolunteers.length) throw new Error("No eligible volunteers");

    let engineResult;
    try {
      engineResult = await optimizeAllocation({ zones: safeZones, volunteers: safeVolunteers });

      if (!engineResult.success) {
        throw new Error(`Engine failed at ${engineResult.stage}: ${engineResult.error}`);
      }
    } catch (err) {
      console.error("Allocation engine error:", err.message);
      throw err;
    }

    const allocationPlan = engineResult.allocation;
    const totalImpactScore = engineResult.total_impact;

    if (!allocationPlan || allocationPlan.length === 0) {
      throw new Error("Empty allocation result");
    }

    let explanationText = null;
    try {
      const explanation = await generateExplanation({ allocationPlan, totalImpactScore });
      explanationText = JSON.stringify(explanation);
    } catch (err) {
      console.error("Gemini explanation failed:", err.message);
    }

    const [saved] = await db
      .insert(allocations)
      .values({
        allocationPlan,
        totalImpactScore,
        geminiExplanation: explanationText,
        strategyHints: null,
        triggeredBy: "manual",
      })
      .returning();

    return { message: "Allocation generated successfully", allocation: saved };
  } catch (err) {
    console.error("Allocation pipeline failed:", err.message);
    throw err;
  }
};

export const getCurrentAllocation = async () => {
  try {
    const result = await db.select().from(allocations);
    if (!result.length) return null;
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  } catch (err) {
    console.error("Fetch current allocation failed:", err.message);
    throw err;
  }
};

export const getAllocationHistory = async () => {
  try {
    return await db.select().from(allocations);
  } catch (err) {
    console.error("Fetch allocation history failed:", err.message);
    throw err;
  }
};

export const getAllocationById = async (id) => {
  try {
    const result = await db.select().from(allocations).where(eq(allocations.id, id));
    return result[0];
  } catch (err) {
    console.error("Fetch allocation failed:", err.message);
    throw err;
  }
};

export const applyAllocation = async (allocationId) => {
  try {
    const allocation = await getAllocationById(allocationId);
    if (!allocation) throw new Error("Allocation not found");

    const plan = allocation.allocationPlan;

    await db.update(volunteers).set({ currentZoneId: null, availability: "available" });
    await db.update(zones).set({ currentVolunteers: 0 });

    for (const item of plan) {
      const { volunteerId, zoneId } = item;

      await db
        .update(volunteers)
        .set({ currentZoneId: zoneId, availability: "busy" })
        .where(eq(volunteers.id, volunteerId));

      const zone = await db.select().from(zones).where(eq(zones.id, zoneId));
      if (zone.length) {
        await db
          .update(zones)
          .set({ currentVolunteers: (zone[0].currentVolunteers || 0) + 1 })
          .where(eq(zones.id, zoneId));
      }
    }

    return { message: "Allocation applied successfully" };
  } catch (err) {
    console.error("Apply allocation failed:", err.message);
    throw err;
  }
};