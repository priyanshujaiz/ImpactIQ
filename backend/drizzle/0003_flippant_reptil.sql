CREATE TABLE "allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"allocation_plan" json,
	"total_impact_score" real,
	"gemini_explanation" text,
	"strategy_hints" text,
	"triggered_by" text DEFAULT 'auto',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "field_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_text" text,
	"extracted_data" json,
	"zone_id" uuid,
	"submitted_by" uuid,
	"gemini_confidence" real,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "simulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"baseline_allocation_id" uuid,
	"proposed_changes" json,
	"baseline_impact" real,
	"simulated_impact" real,
	"impact_delta" real,
	"gemini_analysis" text,
	"ai_confidence" real,
	"proposal_efficiency" real,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "zones" ADD COLUMN "need_score" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "field_reports" ADD CONSTRAINT "field_reports_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_reports" ADD CONSTRAINT "field_reports_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_baseline_allocation_id_allocations_id_fk" FOREIGN KEY ("baseline_allocation_id") REFERENCES "public"."allocations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_current_zone_id_zones_id_fk" FOREIGN KEY ("current_zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;