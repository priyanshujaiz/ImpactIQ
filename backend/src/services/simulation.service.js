import { db } from "../db/index.js";
import { simulations, allocations, zones, volunteers } from "../db/schema.js";
import { eq } from "drizzle-orm";

import axios from "axios";
import { analyzeSimulation } from "./gemini.service.js";

const ENGINE_URL = process.env.ENGINE_URL || "http://localhost:8000/engine";

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

export const runSimulation = async (data, userId) => {
  try {
    const { baselineAllocationId, proposedChanges } = data;

    if (!baselineAllocationId) throw new Error("Baseline allocation required");

    const [baseline] = await db
      .select()
      .from(allocations)
      .where(eq(allocations.id, baselineAllocationId));

    if (!baseline) throw new Error("Baseline allocation not found");

    const allZones = await db.select().from(zones);
    const allVolunteers = await db.select().from(volunteers);

    const safeZones = allZones
      .filter((z) => z.status !== "deleted" && z.lat != null && z.lng != null && z.urgency != null)
      .map(sanitizeZone);

    const safeVolunteers = allVolunteers
      .filter((v) => v.status === "active" && v.lat != null && v.lng != null)
      .map(sanitizeVolunteer);

    let simResult;
    try {
      const res = await axios.post(`${ENGINE_URL}/simulate`, {
        zones: safeZones,
        volunteers: safeVolunteers,
        changes: proposedChanges.map((c) => ({
          volunteerId: c.volunteerId,
          toZone: c.toZone,
        })),
      });
      simResult = res.data;
    } catch (err) {
      console.error("Simulation engine failed:", err.message);
      throw new Error("Simulation engine failed");
    }

    const baselineImpact = simResult.baseline;
    const simulatedImpact = simResult.new;
    const impactDelta = simResult.delta;

    const proposalEfficiency =
      baselineImpact === 0 ? 0 : (simulatedImpact / baselineImpact) * 100;

    let geminiAnalysis = null;
    let aiConfidence = null;

    try {
      const analysis = await analyzeSimulation({ baselineImpact, simulatedImpact, impactDelta, changes: proposedChanges });
      geminiAnalysis = JSON.stringify(analysis);
      aiConfidence = analysis.confidence_proposal || null;
    } catch (err) {
      console.error("Gemini simulation analysis failed:", err.message);
    }

    const [saved] = await db
      .insert(simulations)
      .values({
        baselineAllocationId,
        proposedChanges,
        baselineImpact,
        simulatedImpact,
        impactDelta,
        geminiAnalysis,
        aiConfidence,
        proposalEfficiency,
        createdBy: userId,
      })
      .returning();

    return { message: "Simulation completed", simulation: saved };
  } catch (err) {
    console.error("Simulation failed:", err.message);
    throw err;
  }
};

export const getSimulations = async (userId) => {
  return await db.select().from(simulations).where(eq(simulations.createdBy, userId));
};

export const getSimulationById = async (id) => {
  const result = await db.select().from(simulations).where(eq(simulations.id, id));
  return result[0];
};

export const deleteSimulation = async (id) => {
  const [deleted] = await db.delete(simulations).where(eq(simulations.id, id)).returning();
  return deleted;
};