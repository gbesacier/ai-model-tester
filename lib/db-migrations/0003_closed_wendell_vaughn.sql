CREATE TABLE "model_calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"model_id" text NOT NULL,
	"prompt_hash" text NOT NULL,
	"parameters" json NOT NULL,
	"result" text NOT NULL,
	"rating" integer,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "model_calls" ADD CONSTRAINT "model_calls_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_calls" ADD CONSTRAINT "model_calls_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_calls" ADD CONSTRAINT "model_calls_prompt_hash_prompt_library_prompt_hash_fk" FOREIGN KEY ("prompt_hash") REFERENCES "public"."prompt_library"("prompt_hash") ON DELETE restrict ON UPDATE no action;