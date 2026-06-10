import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// 🛑 ADD THIS LOG:
console.log("Database URL Check:", url ? "Variable loaded ✅" : "Variable EMPTY ❌");

if (!url) {
  throw new Error("TURSO_DATABASE_URL is missing from environment variables.");
}

const client = createClient({
  url: url,
  authToken: authToken,
});

export const db = drizzle(client, { schema });