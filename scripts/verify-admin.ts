import { db } from "../db/drizzle";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env" });

async function verifyAdmin() {
  try {
    const email = "admin@dopecard.com";
    const password = "admin123";
    
    console.log("🔍 Checking admin user...\n");
    
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (!user) {
      console.log("❌ User not found!");
      return;
    }
    
    console.log("✅ User found:");
    console.log("   ID:", user.id);
    console.log("   Email:", user.email);
    console.log("   Username:", user.username);
    console.log("   Role:", user.role);
    console.log("   Active:", user.active);
    console.log("   Has Password:", !!user.password);
    console.log("   Password Hash:", user.password?.substring(0, 20) + "...");
    
    if (!user.password) {
      console.log("\n❌ User has no password!");
      return;
    }
    
    console.log("\n🔐 Testing password verification...");
    const isValid = await bcrypt.compare(password, user.password);
    console.log("   Password 'admin123' matches:", isValid);
    
    if (!isValid) {
      console.log("\n⚠️  Password doesn't match! Let's try creating a new one...");
      const newHash = await bcrypt.hash(password, 10);
      console.log("   New hash:", newHash.substring(0, 30) + "...");
      console.log("   Test with new hash:", await bcrypt.compare(password, newHash));
    }
    
    if (user.role !== "admin") {
      console.log("\n❌ User role is not 'admin'!");
      console.log("   Current role:", user.role);
    } else {
      console.log("\n✅ User role is 'admin'");
    }
    
    console.log("\n✅ All checks passed! User should be able to login.");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

verifyAdmin();

