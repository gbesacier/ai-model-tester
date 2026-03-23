CREATE TABLE "model_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" text NOT NULL,
	"provider" text NOT NULL,
	"input_price" integer NOT NULL,
	"output_price" integer NOT NULL,
	"context_length" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"reasoning" boolean DEFAULT false NOT NULL,
	"created" timestamp
);
--> statement-breakpoint
ALTER TABLE "model_providers" ADD CONSTRAINT "model_providers_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;