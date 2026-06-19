/**
 * @file prisma/seed.ts
 * @description Seeds the PostgreSQL database with the default admin accounts.
 * Run via: npx prisma db seed
 * Automatically runs after `prisma db push` in development.
 */

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("[Seed] Seeding database...");

  // Seed primary admin: nardlens@gmail.com
  const email1 = "nardlens@gmail.com";
  const user1 = await prisma.user.findUnique({ where: { email: email1 } });

  if (!user1) {
    const hashedPassword = await bcrypt.hash("Admin@2025#", 12);
    await prisma.user.create({
      data: {
        name: "Administrator",
        username: "nardlens",
        email: email1,
        mobile: "",
        plan: "Enterprise",
        status: "Active",
        role: "admin",
        password: hashedPassword,
      },
    });
    console.log("[Seed] ✅ Seeded primary admin: nardlens@gmail.com");
  } else {
    console.log("[Seed] ℹ️  Primary admin account already exists.");
  }

  // Seed secondary admin: admin@nardlens.com
  const email2 = "admin@nardlens.com";
  const user2 = await prisma.user.findUnique({ where: { email: email2 } });

  if (!user2) {
    const hashedPassword = await bcrypt.hash("Admin@2025#", 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        username: "admin",
        email: email2,
        mobile: "",
        plan: "Enterprise",
        status: "Active",
        role: "admin",
        password: hashedPassword,
      },
    });
    console.log("[Seed] ✅ Seeded secondary admin: admin@nardlens.com");
  } else {
    console.log("[Seed] ℹ️  Secondary admin account already exists.");
  }

  console.log("[Seed] Done.");
}

main()
  .catch((e) => {
    console.error("[Seed] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
