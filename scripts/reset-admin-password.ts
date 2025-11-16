import { db } from "../db/drizzle";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env" });

async function resetAdminPassword() {
  try {
    const email = "admin@dopecard.com";
    const newPassword = "admin123";
    
    console.log("🔍 Finding admin user...");
    
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (!user) {
      console.log("❌ User not found!");
      process.exit(1);
    }
    
    console.log("✅ User found:", user.email);
    console.log("🔐 Hashing new password...");
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log("💾 Updating password in database...");
    
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));
    
    console.log("✅ Password updated successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email:", email);
    console.log("   Password:", newPassword);
    console.log("\n✅ You can now login at /admin/login");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

resetAdminPassword();

