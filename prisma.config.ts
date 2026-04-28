import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  seed: "prisma/seed.ts",
  // Datasource configuration for MongoDB
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
