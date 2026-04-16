CREATE TYPE "public"."role" AS ENUM('ADMIN', 'COORDINATOR', 'SUPERVISOR', 'VOLUNTEER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"password" text,
	"role" "role" DEFAULT 'VOLUNTEER',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
