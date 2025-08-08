import { defineConfig } from "drizzle-kit";

import dotenv from "dotenv";
import path from "path";

// Load .env from the frontend folder (where your drizzle.config.ts lives)
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("DATABASE_URL:", process.env.DATABASE_URL);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});