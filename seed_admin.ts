import "dotenv/config";
import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("Admin@2025#", 10);
  
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: hash,
      role: "admin",
      status: "Active",
      plan: "Enterprise",
      name: "Administrator"
    },
    create: {
      name: "Administrator",
      username: "admin",
      email: "admin@nardlens.ai",
      plan: "Enterprise",
      billingCycle: "Yearly",
      status: "Active",
      role: "admin",
      password: hash,
      mobile: "+1 000-0000"
    }
  });
  console.log("Seeded Admin user!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
