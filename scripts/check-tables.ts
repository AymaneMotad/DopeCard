import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

async function checkTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(process.env.DATABASE_URL);
  
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  
  console.log("Existing tables:");
  tables.forEach((t: any) => console.log(`  - ${t.table_name}`));
  
  process.exit(0);
}

checkTables().catch(console.error);

