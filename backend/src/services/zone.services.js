import { db } from "../db/index.js";
import { zones, volunteers } from "../db/schema.js";
import { eq, and, not, sql } from "drizzle-orm";
import axios from "axios";

const ENGINE_URL = "http://localhost:8000/engine";

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

export const createZone = async (data) => {
  if (data.name) {
    const existingName = await db.select().from(zones).where(eq(zones.name, data.name));
    if (existingName.length) throw new Error(`Zone with name "${data.name}" already exists`);
  }

  if (data.zoneId) {
    const existingCode = await db.select().from(zones).where(eq(zones.zoneId, data.zoneId));
    if (existingCode.length) throw new Error(`Zone code "${data.zoneId}" already exists`);
  }

  const [zone] = await db.insert(zones).values(data).returning();
  return zone;
};

export const getZones = async () => {
  return await db.select().from(zones).where(eq(zones.status, "active"));
};

export const getZoneById = async (id) => {
  const result = await db.select().from(zones).where(eq(zones.id, id));
  return result[0];
};

export const updateZone = async (id, data) => {
  const [updated] = await db.update(zones).set(data).where(eq(zones.id, id)).returning();
  return updated;
};

export const deleteZone = async (id) => {
  const assignedVolunteers = await db
    .select()
    .from(volunteers)
    .where(eq(volunteers.currentZoneId, id));

  if (assignedVolunteers.length > 0) {
    throw new Error(
      `Cannot delete zone — ${assignedVolunteers.length} volunteer(s) still assigned. Unassign them first.`
    );
  }

  const [deleted] = await db
    .update(zones)
    .set({ status: "deleted" })
    .where(eq(zones.id, id))
    .returning();

  return deleted;
};

export const getZoneVolunteers = async (id) => {
  return await db.select().from(volunteers).where(eq(volunteers.currentZoneId, id));
};

export const getZoneHistory = async (id) => {
  return { message: "History will be built from reports later" };
};

export const recomputeZoneScores = async () => {
  const allZones = await db.select().from(zones);

  const safeZones = allZones
    .filter((z) => z.lat != null && z.lng != null && z.urgency != null)
    .map(sanitizeZone);

  const response = await axios.post(`${ENGINE_URL}/score/zones`, { zones: safeZones });
  const scoredZones = response.data.zones;

  for (const z of scoredZones) {
    await db
      .update(zones)
      .set({ needScore: z.need_score })
      .where(eq(zones.id, z.id));
  }

  return scoredZones;
};