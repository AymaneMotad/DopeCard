/**
 * Scanner Router
 * 
 * Handles scanner app operations for managers/staff
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/db/drizzle";
import { userPasses, passUpdates, users } from "@/db/schema";
import { eq, and, or, like } from "drizzle-orm";

export const scannerRouter = router({
  // Scan QR code and get customer info
  scanQR: protectedProcedure
    .input(z.object({ qrData: z.string() }))
    .mutation(async ({ input }) => {
      // QR code contains userId in format: USER{userId} or COFFEE{userId}
      const match = input.qrData.match(/(?:USER|COFFEE)(.+)/);
      if (!match) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid QR code format',
        });
      }

      const userId = match[1];
      
      // Find user and their pass
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        });
      }

      const pass = await db.query.userPasses.findFirst({
        where: eq(userPasses.userId, userId),
        orderBy: (passes, { desc }) => [desc(passes.createdAt)],
      });

      if (!pass) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pass not found for this customer',
        });
      }

      const metadata = pass.metadata as any || {};
      const stampCount = metadata.stampCount || 0;

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        pass: {
          id: pass.id,
          serialNumber: pass.serialNumber,
          stampCount,
          metadata,
        },
      };
    }),

  // Lookup customer by name or phone
  lookupCustomer: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const searchTerm = `%${input.query}%`;
      
      const results = await db.query.users.findMany({
        where: or(
          like(users.username, searchTerm),
          like(users.email, searchTerm),
          like(users.phoneNumber || '', searchTerm)
        ),
        limit: 10,
      });

      return results.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
      }));
    }),

  // Add stamps/points to a pass
  addStamps: protectedProcedure
    .input(
      z.object({
        passId: z.string().uuid(),
        stampCount: z.number().min(1).max(50),
        transactionAmount: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const pass = await db.query.userPasses.findFirst({
        where: eq(userPasses.id, input.passId),
      });

      if (!pass) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pass not found',
        });
      }

      const metadata = pass.metadata as any || {};
      const currentStamps = metadata.stampCount || 0;
      const newStamps = currentStamps + input.stampCount;

      const updatedMetadata = {
        ...metadata,
        stampCount: newStamps,
        lastTransaction: {
          stampsAdded: input.stampCount,
          transactionAmount: input.transactionAmount,
          notes: input.notes,
          timestamp: new Date().toISOString(),
        },
      };

      // Update pass
      await db.update(userPasses)
        .set({
          metadata: updatedMetadata,
          updatedAt: new Date(),
        })
        .where(eq(userPasses.id, input.passId));

      // Record update for Apple Wallet push notifications
      await db.insert(passUpdates).values({
        passId: input.passId,
        metadata: updatedMetadata,
      });

      return {
        success: true,
        newStampCount: newStamps,
      };
    }),

  // Redeem reward
  redeemReward: protectedProcedure
    .input(
      z.object({
        passId: z.string().uuid(),
        rewardType: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const pass = await db.query.userPasses.findFirst({
        where: eq(userPasses.id, input.passId),
      });

      if (!pass) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pass not found',
        });
      }

      const metadata = pass.metadata as any || {};
      const stampCount = metadata.stampCount || 0;

      // For stamp cards, typically need 10 stamps for reward
      const stampsNeeded = metadata.stampsNeeded || 10;

      if (stampCount < stampsNeeded) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Not enough stamps. Need ${stampsNeeded}, have ${stampCount}`,
        });
      }

      const newStamps = stampCount - stampsNeeded;
      const updatedMetadata = {
        ...metadata,
        stampCount: newStamps,
        lastRedemption: {
          rewardType: input.rewardType,
          notes: input.notes,
          timestamp: new Date().toISOString(),
        },
        totalRedemptions: (metadata.totalRedemptions || 0) + 1,
      };

      // Update pass
      await db.update(userPasses)
        .set({
          metadata: updatedMetadata,
          updatedAt: new Date(),
        })
        .where(eq(userPasses.id, input.passId));

      // Record update for push notifications
      await db.insert(passUpdates).values({
        passId: input.passId,
        metadata: updatedMetadata,
      });

      return {
        success: true,
        newStampCount: newStamps,
      };
    }),

  // Get recent transactions
  getRecentTransactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const updates = await db.query.passUpdates.findMany({
        orderBy: (updates, { desc }) => [desc(updates.createdAt)],
        limit: input.limit,
        with: {
          // Note: Need to check if relations are set up
        },
      });

      return updates.map(update => ({
        id: update.id,
        passId: update.passId,
        metadata: update.metadata,
        createdAt: update.createdAt,
      }));
    }),
});

