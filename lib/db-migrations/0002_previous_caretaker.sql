CREATE TABLE "prompt_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt_hash" text NOT NULL,
	"system_prompt" text NOT NULL,
	"input_prompt" text,
	"messages" json,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_library_hash_idx" ON "prompt_library" USING btree ("prompt_hash");