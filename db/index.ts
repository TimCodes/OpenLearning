import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let _db: ReturnType<typeof drizzle>;

try {
  _db = drizzle({
    connection: process.env.DATABASE_URL,
    schema,
    ws: ws,
  });
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to connect to database:', error);
  process.exit(1);
}

export const db = _db;
