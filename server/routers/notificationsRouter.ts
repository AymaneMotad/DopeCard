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
import { sendAPNS } from "@/lib/apns";

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

  // Test notification directly (bypasses QStash for immediate testing)
  testDirect: protectedProcedure
    .input(
      z.object({
        passId: z.string().uuid(),
        pushToken: z.string().optional(), // Optional: for testing without registered device
        title: z.string().min(1).max(100).optional(),
        message: z.string().min(1).max(255),
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
          await sendAPNS({
            token: input.pushToken,
            title: input.title || 'Test Notification',
            body: input.message,
          });
          return {
            success: true,
            message: 'Direct notification sent (test mode)',
            note: 'This bypasses device registration. Use sendManual for production.',
          };
        } catch (error) {
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

      // Send directly to all registered devices
      const results = await Promise.allSettled(
        registrations.map(async (reg) => {
          if (reg.platform === 'ios') {
            await sendAPNS({
              token: reg.pushToken,
              title: input.title || 'Test Notification',
              body: input.message,
            });
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        devicesNotified: successful,
        devicesFailed: failed,
        totalDevices: registrations.length,
        message: 'Direct notification sent (bypassing QStash)',
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

