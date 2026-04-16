import "dotenv/config";
import { db } from "../db/index.js";
import { zones } from "../db/schema.js";
import { volunteers } from "../db/schema.js";

const run = async () => {
  try {
    console.log("🔍 Fetching Zones...\n");

    const allZones = await db.select().from(zones);

    console.log("📦 RAW ZONES:");
    console.dir(allZones, { depth: null });

    console.log("\n🧠 Parsed Zones:");
    const parsedZones = allZones.map(z => ({
      ...z,
      needType: parseIfString(z.needType),
    }));
    console.dir(parsedZones, { depth: null });

    console.log("\n-----------------------------------\n");

    console.log("🔍 Fetching Volunteers...\n");

    const allVolunteers = await db.select().from(volunteers);

    console.log("📦 RAW VOLUNTEERS:");
    console.dir(allVolunteers, { depth: null });

    console.log("\n🧠 Parsed Volunteers:");
    const parsedVolunteers = allVolunteers.map(v => ({
      ...v,
      skills: parseIfString(v.skills),
    }));
    console.dir(parsedVolunteers, { depth: null });

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    process.exit(0);
  }
};

const parseIfString = (val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val.replace(/""/g, '"'));
    } catch (e) {
      console.log("⚠️ Failed to parse:", val);
      return val;
    }
  }
  return val;
};

run();