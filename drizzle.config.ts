import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "./server.env" });

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
