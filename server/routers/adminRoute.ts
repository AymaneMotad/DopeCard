// Admin router for managing users, clients, managers, etc.
import { adminProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { users, client, commercialAgent, managers } from "@/db/schema";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Base user schema
const baseUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  phoneNumber: z.string().optional(),
  password: z.string().min(8),
});

// Role-specific schemas
const clientSchema = z.object({
  businessName: z.string(),
  businessType: z.string(),
  subscriptionPack: z.enum(["basic", "premium", "enterprise"]),
});

const commercialSchema = z.object({
  assignedTerritory: z.string(),
  targetQuota: z.number().min(0),
  commissionRate: z.number().min(0).max(100),
});

const managerSchema = z.object({
  clientId: z.string().uuid(),
});

// Combined input schema
const createUserSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("admin"),
    ...baseUserSchema.shape,
  }),
  z.object({
    role: z.literal("client"),
    ...baseUserSchema.shape,
    ...clientSchema.shape,
  }),
  z.object({
    role: z.literal("commercial"),
    ...baseUserSchema.shape,
    ...commercialSchema.shape,
  }),
  z.object({
    role: z.literal("manager"),
    ...baseUserSchema.shape,
    ...managerSchema.shape,
  }),
]);

export const adminRouter = router({
  // Create user (admin only)
  createUser: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Start database transaction
        return await db.transaction(async (tx) => {
          // Create base user
          const [newUser] = await tx.insert(users)
            .values({
              role: input.role,
              email: input.email,
              username: input.username,
              phoneNumber: input.phoneNumber,
              password: hashedPassword,
            })
            .returning();

          // Create role-specific record
          switch (input.role) {
            case 'client':
              await tx.insert(client).values({
                userId: newUser.id,
                businessName: input.businessName,
                businessType: input.businessType,
                subscriptionPack: input.subscriptionPack,
                maxManagers: 1,
              });
              break;

            case 'commercial':
              await tx.insert(commercialAgent).values({
                userId: newUser.id,
                assignedTerritory: input.assignedTerritory,
                targetQuota: input.targetQuota,
                commissionRate: input.commissionRate,
              });
              break;

            case 'manager':
              await tx.insert(managers).values({
                userId: newUser.id,
                clientId: input.clientId,
              });
              break;
          }

          return { success: true, user: newUser };
        });

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create user',
          cause: error,
        });
      }
    }),

  // Get all users (admin only)
  getAllUsers: adminProcedure
    .query(async () => {
      return await db.query.users.findMany({
        with: {
          // Note: These relations need to be defined in schema if using drizzle relations
        },
      });
    }),

  // Delete user (admin only)
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const userToDelete = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!userToDelete) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Delete from database
      await db.delete(users)
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Get all clients
  getAllClients: adminProcedure
    .query(async () => {
      return await db.query.client.findMany();
    }),

  // Get all managers
  getAllManagers: adminProcedure
    .query(async () => {
      return await db.query.managers.findMany();
    }),
});
