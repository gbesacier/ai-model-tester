import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, boolean, serial, text, integer, timestamp, json, uniqueIndex } from "drizzle-orm/pg-core";

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const models = pgTable("models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  reasoning: boolean("reasoning").default(false).notNull(),
  created: timestamp("created"),
});

export const modelProviders = pgTable("model_providers", {
  id: serial("id").primaryKey(),
  modelId: text("model_id").notNull().references(() => models.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  inputPrice: integer("input_price").notNull(),
  outputPrice: integer("output_price").notNull(),
  contextLength: integer("context_length").notNull(),
});

export const promptLibrary = pgTable(
  "prompt_library",
  {
    id: serial("id").primaryKey(),
    promptHash: text("prompt_hash").notNull(),
    systemPrompt: text("system_prompt").notNull(),
    inputPrompt: text("input_prompt"),
    messages: json("messages"),
    usageCount: integer("usage_count").default(0).notNull(),
    created: timestamp("created").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("prompt_library_hash_idx").on(table.promptHash),
  ]
);

export const modelCalls = pgTable("model_calls", {
  id: serial("id").primaryKey(),
  userEmail: text("user_email").notNull().references(() => users.email, { onDelete: "restrict" }),
  modelId: text("model_id").notNull().references(() => models.id, { onDelete: "restrict" }),
  promptHash: text("prompt_hash").notNull().references(() => promptLibrary.promptHash, { onDelete: "restrict" }),
  parameters: json("parameters").notNull(),
  result: text("result").notNull(),
  rating: integer("rating"),
  created: timestamp("created").defaultNow().notNull(),
});
