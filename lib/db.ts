import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, serial, text } from "drizzle-orm/pg-core";

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});
