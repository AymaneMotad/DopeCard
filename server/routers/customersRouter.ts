/**
 * Customers Router
 * 
 * Handles customer management operations
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/db/drizzle";
import { users, userPasses, customer } from "@/db/schema";
import { eq, or, like } from "drizzle-orm";

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
        where: eq(users.role, 'client'),
        limit: input.limit,
        offset: input.offset,
      });

      if (input.search) {
        // Note: This is simplified - drizzle query builder would need proper filtering
        const allUsers = await db.query.users.findMany({
          where: eq(users.role, 'client'),
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
});

