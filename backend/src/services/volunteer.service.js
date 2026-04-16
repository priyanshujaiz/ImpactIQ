import { db } from "../db/index.js";
import { volunteers, zones } from "../db/schema.js";
import { eq, and, not, sql } from "drizzle-orm";

// ✅ CREATE
export const createVolunteer = async (data) => {
  const [vol] = await db.insert(volunteers).values(data).returning();
  return vol;
};

// ✅ GET ALL (with filters)
export const getVolunteers = async (filters = {}) => {
  // 🔒 BUG 6 FIX: always exclude soft-deleted volunteers
  const conditions = [not(eq(volunteers.status, "deleted"))];

  if (filters.availability) {
    conditions.push(eq(volunteers.availability, filters.availability));
  }

  return await db
    .select()
    .from(volunteers)
    .where(and(...conditions));
};

// ✅ GET ONE
export const getVolunteerById = async (id) => {
  const result = await db
    .select()
    .from(volunteers)
    .where(eq(volunteers.id, id));

  return result[0];
};

// ✅ UPDATE
export const updateVolunteer = async (id, data) => {
  delete data.reliabilityScore; // 🔥 prevent manual update

  const [updated] = await db
    .update(volunteers)
    .set(data)
    .where(eq(volunteers.id, id))
    .returning();

  return updated;
};

// ✅ SOFT DELETE
export const deleteVolunteer = async (id) => {
  const [deleted] = await db
    .update(volunteers)
    .set({ status: "deleted" })
    .where(eq(volunteers.id, id))
    .returning();

  return deleted;
};

// 📍 UPDATE LOCATION
export const updateLocation = async (id, lat, lng) => {
  const [updated] = await db
    .update(volunteers)
    .set({ lat, lng })
    .where(eq(volunteers.id, id))
    .returning();

  return updated;
};

// 🔄 UPDATE AVAILABILITY
export const updateAvailability = async (id, availability) => {
  const [updated] = await db
    .update(volunteers)
    .set({ availability })
    .where(eq(volunteers.id, id))
    .returning();

  return updated;
};
export const assignVolunteer = async (volunteerId, zoneId) => {
  const volunteer = await getVolunteerById(volunteerId);
  if (!volunteer) throw new Error("Volunteer not found");

  if (volunteer.status === "deleted")
    throw new Error("Volunteer is deleted");

  if (volunteer.availability === "offline")
    throw new Error("Volunteer is offline");

  // 🔍 find zone using code
  const newZone = await db
    .select()
    .from(zones)
    .where(eq(zones.zoneId, zoneId));

  if (!newZone.length) throw new Error("Zone not found");

  const zoneid = newZone[0].id; // ✅ real ID extracted

  if (volunteer.currentZoneId === zoneid) return volunteer;

  const oldZoneId = volunteer.currentZoneId;

  // 🔻 decrement old zone
  if (oldZoneId) {
    await db
      .update(zones)
      .set({
        currentVolunteers: sql`${zones.currentVolunteers} - 1`,
      })
      .where(eq(zones.id, oldZoneId));
  }

  // 🔺 increment new zone
  await db
    .update(zones)
    .set({
      currentVolunteers: sql`${zones.currentVolunteers} + 1`,
    })
    .where(eq(zones.id, zoneid));

  // update volunteer — BUG 1 FIX: also flip availability to "busy"
  const [updated] = await db
    .update(volunteers)
    .set({ currentZoneId: zoneid, availability: "busy" })
    .where(eq(volunteers.id, volunteerId))
    .returning();

  return updated;
};

// 📋 AVAILABLE VOLUNTEERS
export const getAvailableVolunteers = async () => {
  return await db
    .select()
    .from(volunteers)
    .where(
      and(
        eq(volunteers.availability, "available"),
        eq(volunteers.status, "active")
      )
    );
};

// ❌ UNASSIGN FROM ZONE
export const unassignVolunteer = async (id) => {
  const volunteer = await getVolunteerById(id);
  if (!volunteer) throw new Error("Volunteer not found");
  if (volunteer.status === "deleted") throw new Error("Volunteer is deleted");
  if (!volunteer.currentZoneId) throw new Error("Volunteer is not assigned to any zone");

  // 🔻 decrement the zone's volunteer count
  await db
    .update(zones)
    .set({ currentVolunteers: sql`${zones.currentVolunteers} - 1` })
    .where(eq(zones.id, volunteer.currentZoneId));

  // ✅ clear assignment + reset availability
  const [updated] = await db
    .update(volunteers)
    .set({ currentZoneId: null, availability: "available" })
    .where(eq(volunteers.id, id))
    .returning();

  return updated;
};

// 📜 HISTORY (stub)
export const getVolunteerHistory = async () => {
  return { message: "History will be implemented later" };
};