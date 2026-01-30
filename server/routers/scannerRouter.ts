/**
 * Scanner Router
 * 
 * Handles scanner app operations for managers/staff
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/db/drizzle";
import { userPasses, passUpdates, users, passRegistrations } from "@/db/schema";
import { eq, and, or, like } from "drizzle-orm";
import { enqueueNotification } from "@/lib/qstash";

export const scannerRouter = router({
  // Scan QR code and get customer info
  scanQR: protectedProcedure
    .input(z.object({ qrData: z.string() }))
    .mutation(async ({ input }) => {
      console.log('[Scanner] QR Data received:', input.qrData);
      
      // QR code contains userId in format: USER{userId}, COFFEE{userId}, or just {userId}
      // It could also be a pass ID or serialNumber
      let searchValue: string;
      
      // Try to match COFFEE{userId} or USER{userId} format
      const match = input.qrData.match(/(?:USER|COFFEE)(.+)/);
      if (match) {
        searchValue = match[1].trim();
        console.log('[Scanner] Extracted from prefix:', searchValue);
      } else {
        // Fallback: assume the entire string is the search value
        searchValue = input.qrData.trim();
        console.log('[Scanner] Using raw value:', searchValue);
      }
      
      // Try multiple lookup methods:
      // 1. Try as userId first (most common case)
      let user = await db.query.users.findFirst({
        where: eq(users.id, searchValue),
      });

      let pass = null;

      if (user) {
        console.log('[Scanner] Found user by userId:', user.id);
        // Find pass for this user
        pass = await db.query.userPasses.findFirst({
          where: eq(userPasses.userId, user.id),
          orderBy: (passes, { desc }) => [desc(passes.createdAt)],
        });
      } else {
        // 2. Try as pass ID
        console.log('[Scanner] Trying as pass ID...');
        pass = await db.query.userPasses.findFirst({
          where: eq(userPasses.id, searchValue),
        });

        if (pass) {
          console.log('[Scanner] Found pass by pass ID:', pass.id);
          user = await db.query.users.findFirst({
            where: eq(users.id, pass.userId),
          });
        } else {
          // 3. Try as serialNumber
          console.log('[Scanner] Trying as serialNumber...');
          pass = await db.query.userPasses.findFirst({
            where: eq(userPasses.serialNumber, searchValue),
          });

          if (pass) {
            console.log('[Scanner] Found pass by serialNumber:', pass.serialNumber);
            user = await db.query.users.findFirst({
              where: eq(users.id, pass.userId),
            });
          }
        }
      }

      if (!user) {
        console.error('[Scanner] User not found for search value:', searchValue);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Customer not found. Searched by userId, pass ID, and serialNumber. Received: ${input.qrData}`,
        });
      }

      if (!pass) {
        console.error('[Scanner] Pass not found for user:', user.id);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pass not found for this customer',
        });
      }

      const metadata = pass.metadata as any || {};
      const stampCount = metadata.stampCount || 0;

      // Check device registrations for push notifications
      const registrations = await db.query.passRegistrations.findMany({
        where: eq(passRegistrations.passId, pass.id),
      });

      // Also check by serialNumber to see if there are any registrations at all
      const allRegistrationsForSerial = await db.query.passRegistrations.findMany({
        where: eq(passRegistrations.passId, pass.id),
      });

      console.log('[Scanner] Successfully found customer:', user.username, 'with', stampCount, 'stamps');
      console.log('[Scanner] Pass ID:', pass.id);
      console.log('[Scanner] Pass Serial Number:', pass.serialNumber);
      console.log('[Scanner] Device registrations (by passId):', registrations.length);
      console.log('[Scanner] All registrations for this pass:', allRegistrationsForSerial.length);
      
      if (registrations.length > 0) {
        console.log('[Scanner] Registered devices:', registrations.map(r => ({
          registrationId: r.id,
          deviceId: r.deviceLibraryIdentifier,
          platform: r.platform,
          pushTokenLength: r.pushToken?.length || 0,
          createdAt: r.createdAt
        })));
      } else {
        // Debug: Check if there are ANY registrations in the database
        const allRegistrations = await db.query.passRegistrations.findMany({});
        console.log('[Scanner] ⚠️ No registrations found for this pass. Total registrations in DB:', allRegistrations.length);
        if (allRegistrations.length > 0) {
          console.log('[Scanner] Sample registrations:', allRegistrations.slice(0, 3).map(r => ({
            passId: r.passId,
            deviceId: r.deviceLibraryIdentifier
          })));
        }
      }

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
        deviceRegistrations: registrations.length,
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

      // Trigger push notification
      try {
        await enqueueNotification({
          userId: pass.userId,
          passId: input.passId,
          title: "Stamp Added! 🎉",
          body: `You earned ${input.stampCount} stamp(s)! Total: ${newStamps}`,
        });
      } catch (error) {
        // Don't fail the transaction if notification fails
        console.error('Failed to enqueue notification:', error);
      }

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

      // Trigger push notification for reward redemption
      try {
        await enqueueNotification({
          userId: pass.userId,
          passId: input.passId,
          title: "Reward Redeemed! 🎁",
          body: `Congratulations! You redeemed ${input.rewardType}. ${newStamps} stamps remaining.`,
        });
      } catch (error) {
        // Don't fail the transaction if notification fails
        console.error('Failed to enqueue notification:', error);
      }

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

