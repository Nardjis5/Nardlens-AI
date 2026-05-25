/**
 * POST /api/auth/login
 * Validates credentials against PostgreSQL, issues JWT in HTTP-only cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionCookie, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found. Please register first." }, { status: 401 });
    }

    if (user.status === "Suspended") {
      return NextResponse.json({ error: "This account has been suspended by the administrator." }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = setSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "user",
      plan: user.plan,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    const msg = error?.message || "";
    if (msg.includes("DATABASE_URL environment variable is missing")) {
      return NextResponse.json({
        error: "Database Connection Failed: DATABASE_URL environment variable is missing in the production platform settings."
      }, { status: 503 });
    }
    if (msg.includes("Authentication failed") || msg.includes("Can't reach database") || msg.includes("looks like your database is not running")) {
      return NextResponse.json({
        error: "Database Connection Failed: Please verify that PostgreSQL is running locally and that the credentials/database in your .env file are correct."
      }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
