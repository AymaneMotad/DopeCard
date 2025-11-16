import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log("🔍 Checking current database state...\n");
    
    // Check existing tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log("Existing tables:", tables.map((t: any) => t.table_name).join(", ") || "None");
    
    // Check pass_registrations columns
    const passRegColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pass_registrations' 
      AND table_schema = 'public';
    `;
    
    if (passRegColumns.length > 0) {
      console.log("\n⚠️  pass_registrations table has wrong schema:");
      console.log("   Columns:", passRegColumns.map((c: any) => c.column_name).join(", "));
      console.log("\n📋 Expected columns: id, pass_id, push_token, device_library_identifier, platform, created_at, updated_at");
      console.log("\n🗑️  Dropping old pass_registrations table...");
      await sql`DROP TABLE IF EXISTS pass_registrations CASCADE;`;
      console.log("✅ Old table dropped\n");
    }
    
    console.log("✅ Database is ready for drizzle-kit push");
    console.log("\n📝 Next step: Run 'npx drizzle-kit push' to create all tables");
    console.log("   Expected tables to be created:");
    console.log("   1. users (already exists)");
    console.log("   2. clients");
    console.log("   3. commercial_agents");
    console.log("   4. customer");
    console.log("   5. managers");
    console.log("   6. pass_templates");
    console.log("   7. user_passes");
    console.log("   8. pass_registrations (will be recreated with correct schema)");
    console.log("   9. pass_updates");
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
  
  process.exit(0);
}

setupDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});

