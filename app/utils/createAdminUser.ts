import { db } from "../../db/drizzle";
import { users } from "../../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function createAdminUser(email: string, password: string, username: string) {
  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        username,
        role: "admin",
        active: true,
      })
      .returning();

    return newUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
} 