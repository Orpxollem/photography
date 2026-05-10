import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration from .env
const NEON_URL = process.env.VITE_NEON_DATABASE_URL;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

async function migrateNeon() {
  if (!NEON_URL) {
    console.error("❌ VITE_NEON_DATABASE_URL is missing in .env");
    return;
  }

  console.log("🐘 Starting Neon Migrations...");
  const client = new Client({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to Neon.");

    // Create Supabase-specific roles if they don't exist in Neon
    console.log("🛠️ Ensuring Supabase roles exist in Neon...");
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon;
        END IF;
      END $$;
    `);

    const migrationsDir = path.join(__dirname, "../supabase/migrations");
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith(".sql")).sort();

    for (const file of sqlFiles) {
      console.log(`📜 Running ${file}...`);
      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
      
      // Improved splitting logic that respects $$ blocks
      const statements = [];
      let currentStatement = "";
      let inDollarQuote = false;
      
      const lines = sql.split("\n");
      for (const line of lines) {
        if (line.includes("$$")) inDollarQuote = !inDollarQuote;
        
        if (line.trim().endsWith(";") && !inDollarQuote) {
          currentStatement += line + "\n";
          statements.push(currentStatement.trim());
          currentStatement = "";
        } else {
          currentStatement += line + "\n";
        }
      }
      if (currentStatement.trim()) statements.push(currentStatement.trim());

      for (const statement of statements) {
        // Skip storage-related statements for Neon (they belong to Supabase internal DB)
        if (statement.toLowerCase().includes("storage.buckets") || statement.toLowerCase().includes("storage.objects")) {
          continue;
        }

        try {
          await client.query(statement);
        } catch (err) {
          // Ignore "already exists" errors (42P07 = table/relation, 42710 = policy/alias, 42701 = column)
          if (err.code === "42P07" || err.code === "42710" || err.code === "42701" || err.message.includes("already exists")) {
            continue;
          }
          console.error(`❌ Error in ${file} at statement: ${statement.substring(0, 50)}...`);
          throw err; 
        }
      }
    }
    console.log("✅ Neon migrations completed successfully.");
  } catch (err) {
    console.error("❌ Neon Migration Error:", err.message);
  } finally {
    await client.end();
  }
}

async function setupSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    console.error("❌ Supabase URL or Service Role Key is missing in .env");
    return;
  }

  console.log("\n⚡ Starting Supabase Setup...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const bucketName = "photography";
    if (!buckets.find(b => b.name === bucketName)) {
      console.log(`📦 Creating storage bucket: ${bucketName}...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
      });
      if (createError) throw createError;
      console.log(`✅ Bucket '${bucketName}' created.`);
    } else {
      console.log(`✅ Bucket '${bucketName}' already exists.`);
    }

    console.log("✅ Supabase setup completed successfully.");
  } catch (err) {
    console.error("❌ Supabase Setup Error:", err.message);
  }
}

async function run() {
  console.log("🚀 Starting Global Migration...");
  await migrateNeon();
  await setupSupabase();
  console.log("\n🏁 All migrations finished.");
}

run();
