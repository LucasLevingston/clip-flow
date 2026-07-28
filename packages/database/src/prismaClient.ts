import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client"

/**
 * Singleton PrismaClient, wired to the Postgres driver adapter Prisma 7
 * requires at runtime (see ADR-0004 — Supabase/Postgres as primary DB).
 * Every app/worker consuming the database imports this, never
 * `new PrismaClient()` directly.
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
})
