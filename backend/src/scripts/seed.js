/**
 * seed.js — Auto-seed zones and volunteers if DB has fewer than 15 of each.
 * Run from server.js on boot: await seedDatabase(15)
 */

import { db } from "../db/index.js";
import { zones, volunteers } from "../db/schema.js";

// ─── Synthetic Zones ──────────────────────────────────────────────────────────
// Real US disaster-prone regions with realistic severity levels

const ZONE_POOL = [
    { zoneId: "ZONE_FL_001", name: "Everglades Wildfire Zone, Florida", lat: 25.77, lng: -80.19, urgency: 8, severity: 8, peopleAffected: 2000, needType: ["rescue", "firefighting", "medical", "evacuation"], trendDelta: 0.2 },
    { zoneId: "ZONE_CA_001", name: "Northern California Flood Zone", lat: 38.58, lng: -121.49, urgency: 7, severity: 7, peopleAffected: 1500, needType: ["rescue", "logistics", "shelter", "food"], trendDelta: 0.1 },
    { zoneId: "ZONE_TX_001", name: "Houston Severe Storm Zone, Texas", lat: 29.76, lng: -95.37, urgency: 7, severity: 7, peopleAffected: 3000, needType: ["rescue", "medical", "shelter", "logistics"], trendDelta: 0.0 },
    { zoneId: "ZONE_OK_001", name: "Oklahoma Wildfire Corridor", lat: 35.47, lng: -97.52, urgency: 9, severity: 9, peopleAffected: 5000, needType: ["rescue", "firefighting", "evacuation", "medical"], trendDelta: 0.5 },
    { zoneId: "ZONE_AK_001", name: "Alaska Earthquake Zone, Anchorage", lat: 61.22, lng: -149.90, urgency: 9, severity: 9, peopleAffected: 4000, needType: ["rescue", "medical", "engineering", "logistics"], trendDelta: 0.3 },
    { zoneId: "ZONE_WA_001", name: "Cascade Volcanic Zone, Washington", lat: 46.85, lng: -121.75, urgency: 8, severity: 8, peopleAffected: 2500, needType: ["evacuation", "medical", "logistics"], trendDelta: 0.1 },
    { zoneId: "ZONE_CO_001", name: "Colorado Wildfire Zone, Rocky Mountains", lat: 39.74, lng: -104.99, urgency: 8, severity: 7, peopleAffected: 1200, needType: ["firefighting", "rescue", "evacuation"], trendDelta: 0.2 },
    { zoneId: "ZONE_LA_001", name: "Louisiana Flood Zone, New Orleans", lat: 29.95, lng: -90.07, urgency: 8, severity: 8, peopleAffected: 3500, needType: ["rescue", "food", "shelter", "logistics"], trendDelta: 0.4 },
    { zoneId: "ZONE_NC_001", name: "North Carolina Storm Surge Zone", lat: 35.23, lng: -80.84, urgency: 7, severity: 6, peopleAffected: 900, needType: ["rescue", "shelter", "logistics"], trendDelta: 0.0 },
    { zoneId: "ZONE_AZ_001", name: "Arizona Drought Zone, Phoenix", lat: 33.45, lng: -112.07, urgency: 6, severity: 6, peopleAffected: 5000, needType: ["food", "water", "logistics"], trendDelta: 0.1 },
    { zoneId: "ZONE_MN_001", name: "Minnesota Severe Winter Storm Zone", lat: 44.98, lng: -93.27, urgency: 7, severity: 7, peopleAffected: 2000, needType: ["shelter", "logistics", "medical"], trendDelta: 0.0 },
    { zoneId: "ZONE_MS_001", name: "Mississippi Delta Flood Zone", lat: 32.32, lng: -90.21, urgency: 8, severity: 8, peopleAffected: 2800, needType: ["rescue", "food", "logistics", "shelter"], trendDelta: 0.3 },
    { zoneId: "ZONE_OR_001", name: "Oregon Coast Wildfire Zone", lat: 44.94, lng: -123.03, urgency: 8, severity: 7, peopleAffected: 1000, needType: ["firefighting", "rescue", "medical"], trendDelta: 0.1 },
    { zoneId: "ZONE_GA_001", name: "Georgia Hurricane Prep Zone, Savannah", lat: 32.08, lng: -81.09, urgency: 7, severity: 7, peopleAffected: 1800, needType: ["evacuation", "logistics", "shelter"], trendDelta: 0.0 },
    { zoneId: "ZONE_NM_001", name: "New Mexico Wildfire Zone, Santa Fe", lat: 35.69, lng: -105.94, urgency: 8, severity: 8, peopleAffected: 800, needType: ["firefighting", "rescue", "evacuation"], trendDelta: 0.2 },
    { zoneId: "ZONE_KY_001", name: "Kentucky Landslide Zone, Appalachians", lat: 37.84, lng: -84.27, urgency: 7, severity: 7, peopleAffected: 600, needType: ["rescue", "engineering", "medical"], trendDelta: 0.0 },
    { zoneId: "ZONE_WV_001", name: "West Virginia Flood Zone", lat: 38.35, lng: -81.63, urgency: 8, severity: 7, peopleAffected: 1100, needType: ["rescue", "medical", "food"], trendDelta: 0.1 },
    { zoneId: "ZONE_SD_001", name: "South Dakota Wildfire Zone, Black Hills", lat: 44.08, lng: -103.23, urgency: 8, severity: 8, peopleAffected: 700, needType: ["firefighting", "rescue", "evacuation"], trendDelta: 0.3 },
];

// ─── Synthetic Volunteers ─────────────────────────────────────────────────────

const VOLUNTEER_POOL = [
    { name: "Marcus Rivera", skills: ["rescue", "firefighting"], lat: 40.71, lng: -74.00, reliability: 0.92, availability: "available" },
    { name: "Priya Nair", skills: ["medical", "first-aid"], lat: 34.05, lng: -118.24, reliability: 0.89, availability: "available" },
    { name: "James Okafor", skills: ["logistics", "coordination"], lat: 41.88, lng: -87.63, reliability: 0.85, availability: "available" },
    { name: "Sofia Mendez", skills: ["rescue", "evacuation"], lat: 29.76, lng: -95.37, reliability: 0.91, availability: "available" },
    { name: "Arun Patel", skills: ["engineering", "sanitation"], lat: 33.45, lng: -112.07, reliability: 0.87, availability: "available" },
    { name: "Chloe Thompson", skills: ["medical", "counseling"], lat: 47.61, lng: -122.33, reliability: 0.88, availability: "available" },
    { name: "David Nguyen", skills: ["firefighting", "rescue"], lat: 37.77, lng: -122.42, reliability: 0.93, availability: "available" },
    { name: "Amara Diallo", skills: ["food-distribution", "logistics"], lat: 32.78, lng: -96.80, reliability: 0.84, availability: "available" },
    { name: "Ethan Brooks", skills: ["coordination", "communication"], lat: 39.95, lng: -75.17, reliability: 0.86, availability: "available" },
    { name: "Leila Hassan", skills: ["medical", "evacuation"], lat: 25.77, lng: -80.19, reliability: 0.90, availability: "available" },
    { name: "Carlos Vega", skills: ["rescue", "engineering"], lat: 36.17, lng: -115.14, reliability: 0.88, availability: "available" },
    { name: "Nadia Kim", skills: ["counseling", "first-aid"], lat: 33.75, lng: -84.39, reliability: 0.83, availability: "available" },
    { name: "Samuel Wright", skills: ["firefighting", "logistics"], lat: 44.98, lng: -93.27, reliability: 0.91, availability: "available" },
    { name: "Fatima Al-Zahra", skills: ["food-distribution", "medical"], lat: 35.47, lng: -97.52, reliability: 0.87, availability: "available" },
    { name: "Jake Morrison", skills: ["rescue", "coordination"], lat: 39.74, lng: -104.99, reliability: 0.89, availability: "available" },
    { name: "Mei Chen", skills: ["engineering", "logistics"], lat: 30.27, lng: -97.74, reliability: 0.85, availability: "available" },
    { name: "Isaac Johansson", skills: ["firefighting", "evacuation"], lat: 45.52, lng: -122.68, reliability: 0.92, availability: "available" },
    { name: "Anya Sharma", skills: ["medical", "coordination"], lat: 42.36, lng: -71.06, reliability: 0.90, availability: "available" },
];

// ─── Main seed function ───────────────────────────────────────────────────────

/**
 * Ensures both zones and volunteers tables have at least `minCount` records.
 * Safe to call on every restart: deduplicates by zoneId / name.
 *
 * @param {number} minCount - Minimum required count for each table (default: 15)
 */
export const seedDatabase = async (minCount = 15) => {
    await seedZones(minCount);
    await seedVolunteers(minCount);
};

// ── Zones ─────────────────────────────────────────────────────────────────────

async function seedZones(minCount) {
    try {
        const existing = await db.select().from(zones);
        const count = existing.length;

        if (count >= minCount) {
            console.log(`🗺️  Zones OK (${count} in DB, min ${minCount})`);
            return;
        }

        const existingIds = new Set(existing.map((z) => z.zoneId));
        const toInsert = ZONE_POOL.filter((z) => !existingIds.has(z.zoneId)).slice(
            0,
            minCount - count
        );

        if (toInsert.length === 0) {
            console.log("🗺️  Zone pool exhausted — no new zones to seed");
            return;
        }

        console.log(`🗺️  Seeding ${toInsert.length} synthetic zones (DB had ${count})...`);

        for (const z of toInsert) {
            await db.insert(zones).values({
                zoneId: z.zoneId,
                name: z.name,
                lat: z.lat,
                lng: z.lng,
                urgency: z.urgency,
                severity: z.severity,
                peopleAffected: z.peopleAffected,
                needType: z.needType,
                needScore: 0,
                currentVolunteers: 0,
                trendDelta: z.trendDelta,
                status: "active",
            });
        }

        console.log(`✅ Zones seeded — added ${toInsert.length} zones`);
    } catch (err) {
        console.error("❌ Zone seed failed:", err.message);
    }
}

// ── Volunteers ────────────────────────────────────────────────────────────────

async function seedVolunteers(minCount) {
    try {
        const existing = await db.select().from(volunteers);
        const count = existing.length;

        if (count >= minCount) {
            console.log(`👥 Volunteers OK (${count} in DB, min ${minCount})`);
            return;
        }

        const existingNames = new Set(existing.map((v) => v.name));
        const toInsert = VOLUNTEER_POOL.filter((v) => !existingNames.has(v.name)).slice(
            0,
            minCount - count
        );

        if (toInsert.length === 0) {
            console.log("👥 Volunteer pool exhausted — no new volunteers to seed");
            return;
        }

        console.log(`👥 Seeding ${toInsert.length} volunteers (DB had ${count})...`);

        for (const v of toInsert) {
            await db.insert(volunteers).values({
                name: v.name,
                skills: v.skills,
                lat: v.lat,
                lng: v.lng,
                availability: v.availability,
                reliabilityScore: v.reliability,
                currentZoneId: null,
                status: "active",
            });
        }

        console.log(`✅ Volunteers seeded — added ${toInsert.length} volunteers`);
    } catch (err) {
        console.error("❌ Volunteer seed failed:", err.message);
    }
}
