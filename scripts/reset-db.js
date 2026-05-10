import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

const NEON_URL = process.env.VITE_NEON_DATABASE_URL;

async function resetDatabase() {
  if (!NEON_URL) {
    console.error("❌ VITE_NEON_DATABASE_URL is missing in .env");
    return;
  }

  console.log("⚠️ WARNING: This will delete ALL data from your database tables.");
  console.log("Connecting to Neon...");
  
  const client = new Client({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to Neon.");

    // Truncate tables and reset identity sequences
    // CASCADE ensures that related data (like images in a series) are also cleared
    const query = `
      TRUNCATE TABLE series_images, series, exhibitions, site_settings RESTART IDENTITY CASCADE;
    `;

    console.log("🧹 Clearing all tables...");
    await client.query(query);
    console.log("✅ Database reset successfully. All tables are now empty.");
    
  } catch (err) {
    console.error("❌ Reset Error:", err.message);
  } finally {
    await client.end();
  }
}

resetDatabase();
