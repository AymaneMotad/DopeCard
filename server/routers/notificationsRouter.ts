/**
 * Notifications Router
 * 
 * Handles push notification operations with QStash queue
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/db/drizzle";
import { passRegistrations, userPasses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { enqueueNotification } from "@/lib/qstash";
import { sendWalletPush } from "@/lib/apns";

export const notificationsRouter = router({
  // Send manual push notification (enqueues to QStash)
  sendManual: protectedProcedure
    .input(
      z.object({
        passId: z.string().uuid(),
        title: z.string().min(1).max(100).optional(),
        message: z.string().min(1).max(255),
        link: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify pass exists
      const pass = await db.query.userPasses.findFirst({
        where: eq(userPasses.id, input.passId),
      });

      if (!pass) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pass not found',
        });
      }

      // Find pass registrations (devices that have this pass)
      const registrations = await db.query.passRegistrations.findMany({
        where: eq(passRegistrations.passId, input.passId),
      });

      if (registrations.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No devices registered for this pass',
        });
      }

      // Enqueue notification to QStash (non-blocking)
      await enqueueNotification({
        userId: pass.userId,
        passId: input.passId,
        title: input.title || 'Loyalty Card Update',
        body: input.message,
        link: input.link,
      });

      return {
        success: true,
        devicesNotified: registrations.length,
        message: 'Notification queued for sending',
      };
    }),

  // Test Wallet push directly (bypasses QStash for immediate testing)
  // NOTE: For Apple Wallet, this sends an EMPTY push that signals the device to fetch the updated pass
  testDirect: protectedProcedure
    .input(
      z.object({
        passId: z.string().uuid(),
        pushToken: z.string().optional(), // Optional: for testing without registered device
      })
    )
    .mutation(async ({ input }) => {
      // Verify pass exists
      const pass = await db.query.userPasses.findFirst({
        where: eq(userPasses.id, input.passId),
      });

      if (!pass) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pass not found',
        });
      }

      // If pushToken provided, use it directly (for testing)
      if (input.pushToken) {
        try {
          const result = await sendWalletPush(input.pushToken);
          if (!result.success) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Failed to send Wallet push: ${result.error}`,
            });
          }
          return {
            success: true,
            message: 'Wallet push sent (test mode) - device will fetch updated pass',
            note: 'This bypasses device registration. Use sendManual for production.',
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to send notification: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }

      // Otherwise, find registered devices
      const registrations = await db.query.passRegistrations.findMany({
        where: eq(passRegistrations.passId, input.passId),
      });

      if (registrations.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No devices registered. Provide pushToken for direct testing, or configure webServiceURL in pass generation.',
        });
      }

      // Send Wallet push to all registered iOS devices
      const results = await Promise.allSettled(
        registrations
          .filter(reg => reg.platform === 'ios')
          .map(async (reg) => {
            const result = await sendWalletPush(reg.pushToken);
            if (!result.success) {
              throw new Error(result.error);
            }
            return result;
          })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        devicesNotified: successful,
        devicesFailed: failed,
        totalDevices: registrations.filter(r => r.platform === 'ios').length,
        message: 'Wallet push sent - devices will fetch updated passes',
      };
    }),

  // Send to all customers (enqueues to QStash)
  sendToAll: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100).optional(),
        message: z.string().min(1).max(255),
        link: z.string().url().optional(),
        businessId: z.string().uuid().optional(), // Optional: filter by business
      })
    )
    .mutation(async ({ input }) => {
      // Get all pass registrations (optionally filtered by business)
      // This is a simplified version - in production, you'd filter by business
      const allRegistrations = await db.query.passRegistrations.findMany();

      // Group by passId to avoid duplicate notifications
      const uniquePassIds = [...new Set(allRegistrations.map(r => r.passId))];

      // Enqueue notifications for each pass (QStash handles batching)
      const enqueuePromises = uniquePassIds.map(async (passId) => {
        const pass = await db.query.userPasses.findFirst({
          where: eq(userPasses.id, passId),
        });

        if (!pass) return;

        await enqueueNotification({
          userId: pass.userId,
          passId,
          title: input.title || 'Loyalty Card Update',
          body: input.message,
          link: input.link,
        });
      });

      await Promise.all(enqueuePromises);

      return {
        success: true,
        devicesNotified: allRegistrations.length,
        passesNotified: uniquePassIds.length,
        message: 'Notifications queued for sending',
      };
    }),

  // Get notification history (placeholder)
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implement notification history storage
      return [];
    }),
});

