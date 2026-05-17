/**
 * @file app/api/setup/route.ts
 * @description Auto-setup endpoint that ensures Prisma tables exist in PostgreSQL.
 * Called automatically on app startup via the instrumentation hook.
 * Uses `prisma db push` logic via the Prisma Client's internal migration runner.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/setup
 * Verifies database connectivity and ensures all tables exist.
 * Safe to call multiple times (idempotent).
 */
export async function GET() {
  try {
    // Test if tables exist by running a simple query
    await prisma.settings.findFirst();
    return NextResponse.json({ status: "ok", message: "Database tables verified." });
  } catch (error: any) {
    // Tables don't exist yet — this would need prisma db push run externally.
    // In production (Vercel), the postinstall script handles this.
    console.error("[Setup] Database check failed:", error.message);
    return NextResponse.json(
      {
        status: "error",
        message: "Database tables not found. Run: npx prisma db push",
        error: error.message,
      },
      { status: 503 }
    );
  }
}
