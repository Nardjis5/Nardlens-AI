/**
 * @file instrumentation.ts
 * @description Next.js server instrumentation hook.
 * This file is automatically executed ONCE when the Next.js server starts.
 * To maintain compatibility with both Node.js and Edge runtimes, all Node-specific
 * packages (like pg and child_process) are loaded via dynamic imports.
 */

import type { Client } from "pg";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamic imports to prevent compilation errors in Edge Runtime
    const { execSync } = await import("child_process");
    const { Client } = await import("pg");

    const dbUrl = process.env.DATABASE_URL || process.env.STRUCTORA_DATABASE_URL;
    if (!dbUrl) {
      console.log("[NardLens] No DATABASE_URL found. Skipping auto-provisioning.");
      return;
    }
    if (process.env.STRUCTORA_DATABASE_URL && !process.env.DATABASE_URL) {
      process.env.DATABASE_URL = process.env.STRUCTORA_DATABASE_URL;
    }

    // Parse DATABASE_URL
    const match = dbUrl.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+):?(\d+)?\/([^?]+)/);
    if (!match) {
      console.warn("[NardLens] Invalid DATABASE_URL format.");
      return;
    }

    const targetUser = match[1];
    const targetPassword = match[2];
    const host = match[3];
    const port = match[4] || "5432";
    const targetDb = match[5].split("?")[0];

    console.log(`[NardLens] Checking database status for '${targetDb}'...`);

    let dbExists = false;

    // Step 1: Try connecting directly to the target DB
    try {
      const client = new Client({
        connectionString: dbUrl,
      });
      await client.connect();
      await client.end();
      dbExists = true;
      console.log(`[NardLens] ✅ Database '${targetDb}' is already created and accessible.`);
    } catch (err) {
      console.log(`[NardLens] Database '${targetDb}' does not exist or is inaccessible. Attempting auto-creation...`);
    }

    // Step 2: If DB does not exist, connect to 'postgres' to create it
    if (!dbExists) {
      const superusers = [
        { user: "postgres", password: "" },
        { user: "postgres", password: targetPassword },
        { user: targetUser, password: targetPassword },
      ];

      let adminClient: Client | null = null;

      for (const creds of superusers) {
        try {
          const client = new Client({
            host,
            port: parseInt(port),
            database: "postgres",
            user: creds.user,
            password: creds.password,
          });
          await client.connect();
          adminClient = client;
          console.log(`[NardLens] Connected to 'postgres' database as superuser '${creds.user}'.`);
          break;
        } catch (e) {
          // Keep trying
        }
      }

      if (!adminClient) {
        console.warn(
          `[NardLens] ⚠️  Could not connect to default 'postgres' database as superuser. Please manually create database '${targetDb}'.`
        );
      } else {
        try {
          // Check/Create Role
          const roleRes = await adminClient.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [targetUser]);
          if (roleRes.rowCount === 0) {
            await adminClient.query(`CREATE ROLE ${targetUser} WITH LOGIN PASSWORD '${targetPassword}' SUPERUSER`);
            console.log(`[NardLens] ✅ Created role '${targetUser}'.`);
          }

          // Check/Create Database
          const dbRes = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDb]);
          if (dbRes.rowCount === 0) {
            await adminClient.query(`CREATE DATABASE ${targetDb} OWNER ${targetUser}`);
            await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${targetDb} TO ${targetUser}`);
            console.log(`[NardLens] ✅ Created database '${targetDb}'.`);
          }
        } catch (creationErr: any) {
          console.error("[NardLens] ❌ Failed to auto-provision database/user:", creationErr.message);
        } finally {
          await adminClient.end();
        }
      }
    }

    // Step 3: Run migrations and seed
    try {
      console.log("[NardLens] Syncing database schema with Prisma...");
      execSync("npx prisma db push --accept-data-loss && npx prisma db seed", {
        stdio: "pipe",
        env: process.env,
      });
      console.log("[NardLens] ✅ Database schema is up to date and seeded.");
    } catch (error: any) {
      console.warn(
        "[NardLens] ⚠️  Prisma setup failed:",
        error?.message?.split("\n")[0]
      );
    }
  }
}
