import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://quickbite:quickbite@localhost:5432/quickbite";

export const pg = postgres(databaseUrl, { prepare: true, max: 10 });
export const db = drizzle(pg, { schema });
