import "dotenv/config";
import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("password123", 10);
  
  await prisma.user.createMany({
    data: [
      {
        name: "Acme Corp",
        username: "acme",
        email: "contact@acme.com",
        plan: "Enterprise",
        billingCycle: "Yearly",
        status: "Active",
        role: "user",
        password: hash,
        mobile: "+1 555-0101"
      },
      {
        name: "StartUp Inc",
        username: "startupinc",
        email: "founder@startupinc.io",
        plan: "Pro",
        billingCycle: "Monthly",
        status: "Active",
        role: "user",
        password: hash,
        mobile: "+1 555-0102"
      },
      {
        name: "Local Shop",
        username: "localshop",
        email: "hello@localshop.net",
        plan: "Basic",
        billingCycle: "Monthly",
        status: "Active",
        role: "user",
        password: hash,
        mobile: "+1 555-0103"
      },
      {
        name: "Data Miners LLC",
        username: "dataminers",
        email: "admin@dataminers.co",
        plan: "Pro",
        billingCycle: "Yearly",
        status: "Active",
        role: "user",
        password: hash,
        mobile: "+1 555-0104"
      },
      {
        name: "Suspended User",
        username: "banned",
        email: "spammer@bad.com",
        plan: "Basic",
        billingCycle: "Monthly",
        status: "Suspended",
        role: "user",
        password: hash,
        mobile: "+1 555-0000"
      }
    ],
    skipDuplicates: true
  });
  console.log("Seeded dummy users!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
