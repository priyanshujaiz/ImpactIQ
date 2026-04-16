import "dotenv/config";
import { db } from "../db/index.js";
import { zones, volunteers } from "../db/schema.js";

// 🔥 MAIN SEED FUNCTION
const seedData = async () => {
  try {
    console.log("🌱 Seeding database...");

    // // 🧹 OPTIONAL: CLEAR OLD DATA
    // await db.delete(volunteers);
    // await db.delete(zones);
    // await db.delete(users);
    // =========================
    // 🌍 ZONES
    // =========================
    const insertedZones = await db.insert(zones).values([
      {
        zoneId: "Z1",
        name: "Flood Zone Alpha",
        lat: 22.5726,
        lng: 88.3639,
        urgency: 9,
        peopleAffected: 500,
        severity: 8,
        needType: ["medical", "food"],
        needScore: 9.2,
        currentVolunteers: 2,
        trendDelta: 1.5,
      },
      {
        zoneId: "Z2",
        name: "Relief Camp Beta",
        lat: 22.295,
        lng: 87.3237,
        urgency: 6,
        peopleAffected: 200,
        severity: 5,
        needType: ["shelter"],
        needScore: 6.5,
        currentVolunteers: 4,
        trendDelta: -0.5,
      },
      {
        zoneId: "Z3",
        name: "Medical Emergency Gamma",
        lat: 22.3149,
        lng: 87.3105,
        urgency: 10,
        peopleAffected: 150,
        severity: 9,
        needType: ["medical"],
        needScore: 9.8,
        currentVolunteers: 1,
        trendDelta: 2.0,
      },
    ]).returning();

    // =========================
    // 🙋 VOLUNTEERS
    // =========================
    await db.insert(volunteers).values([
      {
        name: "Rahul",
        skills: ["medical"],
        lat: 22.57,
        lng: 88.36,
        availability: "available",
        reliabilityScore: 0.9,
        currentZoneId: insertedZones[0].id,
      },
      {
        name: "Ankit",
        skills: ["food", "logistics"],
        lat: 22.29,
        lng: 87.32,
        availability: "available",
        reliabilityScore: 0.7,
        currentZoneId: insertedZones[1].id,
      },
      {
        name: "Priya",
        skills: ["medical", "shelter"],
        lat: 22.31,
        lng: 87.31,
        availability: "available",
        reliabilityScore: 0.95,
        currentZoneId: insertedZones[2].id,
      },
      {
        name: "Sneha",
        skills: ["logistics"],
        lat: 22.30,
        lng: 87.33,
        availability: "available",
        reliabilityScore: 0.6,
      },
    ]);

    console.log("✅ Seeding complete!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

// RUN SCRIPT
seedData();