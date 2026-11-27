CREATE TABLE "game_ideas" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"goal" text NOT NULL,
	"challenge" text NOT NULL,
	"reward" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"description" text NOT NULL,
	"device_id" text NOT NULL,
	"emailed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "game_ideas_created_idx" ON "game_ideas" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "game_ideas_device_idx" ON "game_ideas" USING btree ("device_id","created_at");