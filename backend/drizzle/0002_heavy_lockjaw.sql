CREATE TABLE "volunteers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"skills" text[],
	"lat" real,
	"lng" real,
	"availability" text DEFAULT 'available',
	"reliability_score" real DEFAULT 0,
	"current_zone_id" uuid,
	"created_at" timestamp DEFAULT now()
);
