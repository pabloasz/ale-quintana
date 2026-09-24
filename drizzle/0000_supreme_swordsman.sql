CREATE TYPE "public"."number_status" AS ENUM('available', 'reserved', 'paid');--> statement-breakpoint
CREATE TYPE "public"."raffle_status" AS ENUM('active', 'finished');--> statement-breakpoint
CREATE TABLE "numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raffle_id" uuid NOT NULL,
	"number_value" integer NOT NULL,
	"buyer_name" text,
	"buyer_phone" text,
	"status" "number_status" DEFAULT 'available' NOT NULL,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "numbers_raffle_id_number_value_unique" UNIQUE("raffle_id","number_value")
);
--> statement-breakpoint
CREATE TABLE "raffles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"prize_description" text NOT NULL,
	"prize_value" integer,
	"price_per_number" integer NOT NULL,
	"lottery_name" text NOT NULL,
	"prize_image_data_url" text,
	"grid_size" integer DEFAULT 100 NOT NULL,
	"status" "raffle_status" DEFAULT 'active' NOT NULL,
	"draw_date" timestamp,
	"winner_slot_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "numbers" ADD CONSTRAINT "numbers_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffles" ADD CONSTRAINT "raffles_winner_slot_id_numbers_id_fk" FOREIGN KEY ("winner_slot_id") REFERENCES "public"."numbers"("id") ON DELETE no action ON UPDATE no action;