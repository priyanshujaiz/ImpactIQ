CREATE TABLE "zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zone_id" text,
	"name" text,
	"lat" real,
	"lng" real,
	"urgency" integer,
	"people_affected" integer,
	"severity" integer,
	"need_type" text[],
	"current_volunteers" integer DEFAULT 0,
	"trend_delta" real DEFAULT 0,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
