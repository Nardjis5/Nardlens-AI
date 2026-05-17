/**
 * @file src/app/api/users/route.ts
 * @description Next.js API route to list and manage SaaS users in PostgreSQL.
 * Restricted to administrators to secure PII and SaaS management data.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * GET /api/users
 * Returns list of SaaS users for admin panel.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        mobile: true,
        plan: true,
        status: true,
        joinedDate: true,
      },
      orderBy: { joinedDate: "desc" },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("GET /api/users error:", error.message);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Processes actions like toggling user status or cycling plans.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { action, userId } = await req.json();
    if (!action || !userId) {
      return NextResponse.json({ error: "Action and userId are required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 44 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json({ error: "Cannot modify administrator accounts" }, { status: 400 });
    }

    if (action === "toggle_status") {
      const nextStatus = targetUser.status === "Active" ? "Suspended" : "Active";
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { status: nextStatus },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === "cycle_plan") {
      const plans = ["Basic", "Pro", "Enterprise"];
      const nextIndex = (plans.indexOf(targetUser.plan) + 1) % plans.length;
      const nextPlan = plans[nextIndex] as "Basic" | "Pro" | "Enterprise";

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { plan: nextPlan },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/users error:", error.message);
    return NextResponse.json({ error: "Failed to process user update" }, { status: 500 });
  }
}
