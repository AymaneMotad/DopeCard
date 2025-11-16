import { createAdminUser } from "../app/utils/createAdminUser";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

async function main() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set in environment variables");
    }

    const email = process.env.ADMIN_EMAIL || "admin@dopecard.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const username = process.env.ADMIN_USERNAME || "admin";

    console.log("Creating admin user with:", { email, username });
    
    const admin = await createAdminUser(email, password, username);
    console.log("Admin user created successfully:", admin);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

main(); 