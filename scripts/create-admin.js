import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// to run: npm run create-admin

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing required environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const rl = readline.createInterface({ input, output });
  
  try {
    console.log("--- Create Admin User ---\n");

    const email = await rl.question("Email: ");
    const password = await rl.question("Password (min 8 characters): ");
    const fullName = await rl.question("Full name (optional, press Enter to skip): ");

    if (!email || !password) {
      console.error("\nError: Email and password are required.");
      process.exitCode = 1;
      return;
    }

    if (password.length < 8) {
      console.error("\nError: Password must be at least 8 characters.");
      process.exitCode = 1;
      return;
    }

    console.log("\nCreating admin user...");

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || undefined },
      app_metadata: { role: "admin" },
    });

    if (error) {
      console.error("Failed to create user:", error.message);
      process.exitCode = 1;
      return;
    }

    console.log(`\nAdmin user created successfully.`);
    console.log(`  ID:    ${data.user.id}`);
    console.log(`  Email: ${data.user.email}`);
    console.log(`  Role:  admin (stored in app_metadata)`);
  } catch (err) {
    console.error("\nUnexpected error:", err.message);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();
