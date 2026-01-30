/**
 * Customers Router
 * 
 * Handles customer management operations
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/db/drizzle";
import { users, userPasses, customer, passRegistrations, passUpdates } from "@/db/schema";
import { eq, or, like, inArray } from "drizzle-orm";

export const customersRouter = router({
  // Get all customers
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      let query = db.query.users.findMany({
        where: eq(users.role, 'customer'),
        limit: input.limit,
        offset: input.offset,
      });

      if (input.search) {
        // Note: This is simplified - drizzle query builder would need proper filtering
        const allUsers = await db.query.users.findMany({
          where: eq(users.role, 'customer'),
        });

        const filtered = allUsers.filter(
          (user) =>
            user.username.toLowerCase().includes(input.search!.toLowerCase()) ||
            user.email.toLowerCase().includes(input.search!.toLowerCase()) ||
            user.phoneNumber?.toLowerCase().includes(input.search!.toLowerCase())
        );

        return filtered.slice(input.offset, input.offset + input.limit);
      }

      return await query;
    }),

  // Get customer by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.id),
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        });
      }

      // Get customer's passes
      const passes = await db.query.userPasses.findMany({
        where: eq(userPasses.userId, input.id),
      });

      return {
        ...user,
        passes,
      };
    }),

  // Update customer
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        username: z.string().optional(),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const [updated] = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        });
      }

      return { success: true, customer: updated };
    }),

  // Delete customer
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      // Check if customer has passes
      const passes = await db.query.userPasses.findMany({
        where: eq(userPasses.userId, input.id),
      });

      if (passes.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete customer with active passes',
        });
      }

      await db.delete(users).where(eq(users.id, input.id));

      return { success: true };
    }),

  // Get customer's pass details
  getCustomerPass: protectedProcedure
    .input(z.object({ customerId: z.string().uuid() }))
    .query(async ({ input }) => {
      const passes = await db.query.userPasses.findMany({
        where: eq(userPasses.userId, input.customerId),
      });

      return passes;
    }),

  // Delete ALL test users (for testing purposes only)
  // WARNING: This will delete all customers and their associated data
  // SAFETY: Only deletes users with role='customer' - NEVER deletes admin/commercial/manager users
  deleteAllTestUsers: protectedProcedure
    .mutation(async () => {
      try {
        console.log('[Delete All Test Users] Starting deletion process...');

        // Step 1: Get all customer users (role='customer')
        // IMPORTANT: This explicitly filters for ONLY 'customer' role
        const allCustomers = await db.query.users.findMany({
          where: eq(users.role, 'customer'),
        });

        // Double safety check: Filter out any admin/commercial/manager roles (should never happen, but extra safety)
        const safeToDelete = allCustomers.filter(user => user.role === 'customer');
        
        // Log protection info
        const protectedCount = allCustomers.length - safeToDelete.length;
        if (protectedCount > 0) {
          console.log(`[Delete All Test Users] ⚠️ Protected ${protectedCount} non-customer users from deletion`);
        }

        if (safeToDelete.length === 0) {
          console.log('[Delete All Test Users] No customer users found to delete');
          return {
            success: true,
            deleted: {
              users: 0,
              passes: 0,
              registrations: 0,
              updates: 0,
            },
            message: 'No test users to delete',
          };
        }

        const customerIds = safeToDelete.map(u => u.id);
        console.log(`[Delete All Test Users] Found ${customerIds.length} customers (role='customer') to delete`);
        console.log(`[Delete All Test Users] ✅ Protected: admin, commercial, and manager users are SAFE`);

        // Step 2: Get all passes for these customers
        const allPasses = await db.query.userPasses.findMany({
          where: inArray(userPasses.userId, customerIds),
        });
        const passIds = allPasses.map(p => p.id);
        console.log(`[Delete All Test Users] Found ${passIds.length} passes to delete`);

        let deletedRegistrations = 0;
        let deletedUpdates = 0;

        // Step 3: Delete pass registrations (if any passes exist)
        if (passIds.length > 0) {
          const registrationsResult = await db
            .delete(passRegistrations)
            .where(inArray(passRegistrations.passId, passIds))
            .returning();
          deletedRegistrations = registrationsResult.length;
          console.log(`[Delete All Test Users] Deleted ${deletedRegistrations} device registrations`);

          // Step 4: Delete pass updates (if any passes exist)
          const updatesResult = await db
            .delete(passUpdates)
            .where(inArray(passUpdates.passId, passIds))
            .returning();
          deletedUpdates = updatesResult.length;
          console.log(`[Delete All Test Users] Deleted ${deletedUpdates} pass updates`);

          // Step 5: Delete user passes
          await db
            .delete(userPasses)
            .where(inArray(userPasses.userId, customerIds));
          console.log(`[Delete All Test Users] Deleted ${passIds.length} user passes`);
        }

        // Step 6: Delete from customer table (if exists)
        try {
          await db
            .delete(customer)
            .where(inArray(customer.userId, customerIds));
          console.log(`[Delete All Test Users] Deleted customer records`);
        } catch (error) {
          // Customer table might not have entries for all users
          console.log(`[Delete All Test Users] Note: Some customer records may not exist`);
        }

        // Step 7: Delete users
        await db
          .delete(users)
          .where(inArray(users.id, customerIds));
        console.log(`[Delete All Test Users] Deleted ${customerIds.length} users`);

        const result = {
          success: true,
          deleted: {
            users: customerIds.length,
            passes: passIds.length,
            registrations: deletedRegistrations,
            updates: deletedUpdates,
          },
          message: `Successfully deleted ${customerIds.length} test users and all associated data`,
        };

        console.log('[Delete All Test Users] ✅ Deletion complete:', result);
        return result;
      } catch (error) {
        console.error('[Delete All Test Users] ❌ Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete test users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),
});

