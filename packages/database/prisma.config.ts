import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 config — connection URL lives here (used by the CLI for
// migrate/studio), not in schema.prisma. The runtime PrismaClient gets its
// connection via a driver adapter, see src/prismaClient.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
