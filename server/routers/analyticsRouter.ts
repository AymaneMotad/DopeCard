/**
 * Analytics Router
 * 
 * Provides analytics and metrics for the dashboard
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { users, userPasses, passTemplates, passUpdates, client } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export const analyticsRouter = router({
  // Get overview metrics
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    // Get client for this user
    const userClient = await db.query.client.findFirst({
      where: eq(client.userId, ctx.user.id),
    });

    const clientId = userClient?.id || ctx.user.id;

    // Total active customers
    const totalCustomers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'client'));

    // Cards issued this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const cardsThisMonth = await db
      .select({ count: sql<number>`count(*)` })
      .from(userPasses)
      .where(gte(userPasses.createdAt, thisMonth));

    // Total cards
    const totalCards = await db
      .select({ count: sql<number>`count(*)` })
      .from(userPasses);

    // Active cards (with recent activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeCards = await db
      .select({ count: sql<number>`count(*)` })
      .from(userPasses)
      .innerJoin(passUpdates, eq(passUpdates.passId, userPasses.id))
      .where(gte(passUpdates.createdAt, thirtyDaysAgo));

    return {
      totalCustomers: totalCustomers[0]?.count || 0,
      cardsThisMonth: cardsThisMonth[0]?.count || 0,
      totalCards: totalCards[0]?.count || 0,
      activeCards: activeCards[0]?.count || 0,
    };
  }),

  // Get customer statistics
  getCustomerStats: protectedProcedure.query(async () => {
    const customers = await db.query.users.findMany({
      where: eq(users.role, 'client'),
    });

    const passes = await db.query.userPasses.findMany();

    // Calculate average stamps per customer
    let totalStamps = 0;
    let customersWithPasses = 0;

    for (const pass of passes) {
      const metadata = pass.metadata as any || {};
      const stamps = metadata.stampCount || 0;
      totalStamps += stamps;
      if (stamps > 0) {
        customersWithPasses++;
      }
    }

    const avgStamps = customersWithPasses > 0 ? totalStamps / customersWithPasses : 0;

    return {
      totalCustomers: customers.length,
      customersWithPasses,
      averageStamps: Math.round(avgStamps * 10) / 10,
    };
  }),

  // Get recent activity
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const updates = await db.query.passUpdates.findMany({
        orderBy: (updates, { desc }) => [desc(updates.createdAt)],
        limit: input.limit,
      });

      return updates.map(update => ({
        id: update.id,
        passId: update.passId,
        metadata: update.metadata,
        createdAt: update.createdAt,
      }));
    }),
});

