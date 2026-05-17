/**
 * POST /api/auth/register
 * Creates a new user in PostgreSQL, issues JWT in HTTP-only cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionCookie, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, mobile, password } = await req.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const normEmail = email.toLowerCase().trim();
    const normUsername = username.toLowerCase().trim();

    const emailExists = await prisma.user.findUnique({ where: { email: normEmail } });
    if (emailExists) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const usernameExists = await prisma.user.findUnique({ where: { username: normUsername } });
    if (usernameExists) {
      return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        username: normUsername,
        email: normEmail,
        mobile: mobile || "",
        plan: "Basic",
        status: "Active",
        role: "user",
        password: hashedPassword,
      },
    });

    const token = setSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "user",
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
    console.error("Register error:", error);
    const msg = error?.message || "";
    if (msg.includes("Authentication failed") || msg.includes("Can't reach database") || msg.includes("looks like your database is not running")) {
      return NextResponse.json({
        error: "Database Connection Failed: Please verify that PostgreSQL is running locally and that the credentials/database in your .env file are correct."
      }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
