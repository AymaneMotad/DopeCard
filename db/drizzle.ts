import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" }); // Load environment variables

const sql = neon(process.env.DATABASE_URL!); // Ensure DATABASE_URL is set in .env
const db = drizzle(sql); // Directly pass the SQL client

export default db;
