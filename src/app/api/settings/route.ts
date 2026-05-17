/**
 * @file app/api/settings/route.ts
 * @description Next.js App Router API route for reading and writing platform settings.
 * Persists admin API credentials (Gemini key, Playwright URL) to PostgreSQL via Prisma.
 * Deployed as a Vercel serverless function.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_USER_ID = "admin@structora.ai"; // Fixed key for admin settings row

/**
 * GET /api/settings
 * Returns the current saved settings for the admin user.
 */
export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: ADMIN_USER_ID },
    });

    if (!settings) {
      return NextResponse.json({
        geminiKey: "",
        playwrightUrl: "wss://playwright.structora.ai/ws",
        hasValidated: false,
      });
    }

    return NextResponse.json({
      geminiKey: settings.geminiKey,
      playwrightUrl: settings.playwrightUrl,
      hasValidated: settings.hasValidated,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

/**
 * POST /api/settings
 * Upserts the admin settings row with new credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geminiKey, playwrightUrl, hasValidated } = body;

    const settings = await prisma.settings.upsert({
      where: { userId: ADMIN_USER_ID },
      update: {
        geminiKey: geminiKey ?? "",
        playwrightUrl: playwrightUrl ?? "wss://playwright.structora.ai/ws",
        hasValidated: hasValidated ?? false,
      },
      create: {
        userId: ADMIN_USER_ID,
        geminiKey: geminiKey ?? "",
        playwrightUrl: playwrightUrl ?? "wss://playwright.structora.ai/ws",
        hasValidated: hasValidated ?? false,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
