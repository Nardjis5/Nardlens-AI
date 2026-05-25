/**
 * @file lib/prisma.ts
 * @description Singleton Prisma client instance for Next.js.
 * Configured for Prisma 7 using the PostgreSQL driver adapter.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  const connectionString = process.env.DATABASE_URL || process.env.STRUCTORA_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
  if (process.env.STRUCTORA_DATABASE_URL && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = process.env.STRUCTORA_DATABASE_URL;
  }
  
  const pool = new Pool({ 
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
  });
  const adapter = new PrismaPg(pool);
  
  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;
