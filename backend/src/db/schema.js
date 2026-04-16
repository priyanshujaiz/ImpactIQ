import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  integer,
  real,
  json
} from "drizzle-orm/pg-core";

// ENUM
export const roleEnum = pgEnum("role", [
  "ADMIN",
  "COORDINATOR",
  "SUPERVISOR",
  "VOLUNTEER"
]);
export const availabilityEnum = pgEnum("availability_status", [
  "available",
  "busy",
  "offline"
]);

// TABLE
//USERS
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  role: roleEnum("role").default("VOLUNTEER"),
  createdAt: timestamp("created_at").defaultNow(),
});

//Zones
export const zones = pgTable("zones", {
  id: uuid("id").defaultRandom().primaryKey(),

  zoneId: text("zone_id"),
  name: text("name"),

  lat: real("lat"),
  lng: real("lng"),

  urgency: integer("urgency"),          // 1–10
  peopleAffected: integer("people_affected"),
  severity: integer("severity"),        // 1–10

  needType: text("need_type").array(),
  needScore: real("need_score").default(0),

  currentVolunteers: integer("current_volunteers").default(0),

  trendDelta: real("trend_delta").default(0),

  status: text("status").default("active"),

  createdAt: timestamp("created_at").defaultNow(),
});

// ================= VOLUNTEERS =================
export const volunteers = pgTable("volunteers", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name"),

  skills: text("skills").array(),

  lat: real("lat"),
  lng: real("lng"),

  availability: text("availability").default("available"),
  // later we can make enum if needed

  reliabilityScore: real("reliability_score").default(0),

  currentZoneId: uuid("current_zone_id").references(() => zones.id),

  status: text("status").default("active"),

  createdAt: timestamp("created_at").defaultNow(),
});



export const fieldReports = pgTable("field_reports", {
  id: uuid("id").defaultRandom().primaryKey(),

  rawText: text("raw_text"), // original note

  extractedData: json("extracted_data"),
  // Gemini parsed JSON (zone, urgency, etc.)

  zoneId: uuid("zone_id").references(() => zones.id),

  submittedBy: uuid("submitted_by").references(() => users.id),

  geminiConfidence: real("gemini_confidence"), // 0–1

  status: text("status").default("pending"),
  // pending | processed | rejected

  createdAt: timestamp("created_at").defaultNow(),
});

export const allocations = pgTable("allocations", {
  id: uuid("id").defaultRandom().primaryKey(),

  allocationPlan: json("allocation_plan"),
  // [{ volunteerId, zoneId, impactScore, suitability }]

  totalImpactScore: real("total_impact_score"),

  geminiExplanation: text("gemini_explanation"),
  // full explanation text

  strategyHints: text("strategy_hints"),
  // output from Gemini situation analysis

  triggeredBy: text("triggered_by").default("auto"),
  // auto | manual | report_ingestion

  createdAt: timestamp("created_at").defaultNow(),
});


export const simulations = pgTable("simulations", {
  id: uuid("id").defaultRandom().primaryKey(),

  baselineAllocationId: uuid("baseline_allocation_id")
    .references(() => allocations.id),

  proposedChanges: json("proposed_changes"),
  // [{ volunteerId, fromZone, toZone }]

  baselineImpact: real("baseline_impact"),
  simulatedImpact: real("simulated_impact"),

  impactDelta: real("impact_delta"),

  geminiAnalysis: text("gemini_analysis"),
  // trade-off explanation

  aiConfidence: real("ai_confidence"), // 0–100

  proposalEfficiency: real("proposal_efficiency"), // %

  createdBy: uuid("created_by").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow(),
});

//ALERTs
export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),

  zoneId: uuid("zone_id").references(() => zones.id),

  type: text("type"), // critical | warning | info

  message: text("message"),
  suggestedAction: text("suggested_action"),

  status: text("status").default("active"), // active | resolved

  createdAt: timestamp("created_at").defaultNow(),
});