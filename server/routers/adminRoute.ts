// server/api/routers/users.ts
import { publicProcedure, router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { users, client, commercialAgent, managers } from "@/db/schema";
import { db } from "@/db/drizzle";
import { auth, clerkClient } from '@clerk/nextjs/server'


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

export const usersRouter = router({
  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const adminUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, ctx.auth.userId)
      });

      if (!adminUser || adminUser.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Only admins can create users',
        });
      }

      try {
        // Create user in Clerk
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [input.email],
          password: input.password,
          username: input.username,
        });

        // Start database transaction
        return await db.transaction(async (tx) => {
          // Create base user
          const [newUser] = await tx.insert(users)
            .values({
              clerkId: clerkUser.id,
              role: input.role,
              email: input.email,
              username: input.username,
              phoneNumber: input.phoneNumber,
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
                permissions: input.permissions,
              });
              break;
          }

          return { success: true, user: newUser };
        });

      } catch (error) {
        // If there's an error, attempt to delete the Clerk user if it was created
        if (error instanceof Error && 'clerkUser' in this) {
          await clerkClient.users.deleteUser(this.clerkUser.id).catch(() => {});
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create user',
          cause: error,
        });
      }
    }),

  // Get all users
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const adminUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, ctx.auth.userId)
      });

      if (!adminUser || adminUser.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Only admins can view all users',
        });
      }

      return await db.query.users.findMany({
        with: {
          client: true,
          manager: true,
          commercialAgent: true,
        },
      });
    }),

  // Delete user
  delete: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const adminUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, ctx.auth.userId)
      });

      if (!adminUser || adminUser.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Only admins can delete users',
        });
      }

      const userToDelete = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input.userId)
      });

      if (!userToDelete) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Delete from Clerk first
      await clerkClient.users.deleteUser(userToDelete.clerkId);

      // Then delete from your database
      await db.delete(users)
        .where(eq(users.id, input.userId));

      return { success: true };
    }),
});