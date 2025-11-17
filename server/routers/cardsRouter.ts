/**
 * Cards Router
 * 
 * Handles card template creation and management
 */

import { router, protectedProcedure, adminProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/db/drizzle";
import { passTemplates, client } from "@/db/schema";
import { eq } from "drizzle-orm";

// Card creation input schema
const cardCreationSchema = z.object({
  // Section 1: Card Type
  type: z.enum(['loyalty', 'coupon', 'eventTicket', 'boardingPass', 'generic']), // Apple Wallet pass type
  cardType: z.enum(['stamp', 'points', 'discount', 'cashback', 'multipass', 'coupon', 'reward', 'membership', 'gift']), // Business card type
  
  // Section 2: Settings
  expiration: z.enum(['none', '30', '60', '90', '180', '365']).optional(),
  language: z.string().default('en'),
  
  // Card-type-specific settings
  stampCount: z.number().min(2).max(50).optional(),
  pointsRate: z.number().min(1).max(10).optional(),
  discountTiers: z.array(z.number()).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  cashbackPercentage: z.number().min(0).max(100).optional(),
  balance: z.number().min(0).optional(),
  classesPerMonth: z.number().min(0).optional(),
  
  // Section 3: Design
  logo: z.string().url().optional(),
  icon: z.string().url().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  
  // Section 4: Information
  name: z.string().min(1),
  businessName: z.string().min(1),
  description: z.string().optional(),
  rewardDetails: z.record(z.any()).optional(),
  terms: z.string().optional(),
  
  // Section 5: Platform Preferences
  platformAppleWallet: z.boolean().default(true),
  platformGoogleWallet: z.boolean().default(true),
  platformPWA: z.boolean().default(false),
  
  // Section 6: Activation
  active: z.boolean().default(false),
});

const cardUpdateSchema = cardCreationSchema.partial();

export const cardsRouter = router({
  // Create a new card template
  create: protectedProcedure
    .input(cardCreationSchema)
    .mutation(async ({ input, ctx }) => {
      // Get client ID from user session
      // For now, we'll need to get it from the user's client relationship
      // This assumes the user is a client or admin
      
      try {
        // Find client for this user (if user is a client)
        let userClient = await db.query.client.findFirst({
          where: eq(client.userId, ctx.user.id),
        });

        // For admin users creating test cards, create a default test client if none exists
        if (!userClient && ctx.user.role === 'admin') {
          try {
            // Create a default test client for the admin
            const [newClient] = await db.insert(client).values({
              userId: ctx.user.id,
              businessName: input.businessName || 'Test Business',
              businessType: 'test',
              subscriptionPack: 'basic',
              maxManagers: 1,
              active: true,
            }).returning();
            userClient = newClient;
          } catch (error: any) {
            // If client creation fails (e.g., duplicate), try to find existing client
            if (error?.code === '23505' || error?.message?.includes('unique')) {
              userClient = await db.query.client.findFirst({
                where: eq(client.userId, ctx.user.id),
              });
            }
            // If still no client found, rethrow the error
            if (!userClient) {
              throw error;
            }
          }
        }

        if (!userClient && ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only clients or admins can create cards',
          });
        }

        if (!userClient) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create or find client for card creation',
          });
        }

        const clientId = userClient.id;

        // Create card template
        const [cardTemplate] = await db.insert(passTemplates).values({
          clientId: clientId,
          name: input.name,
          type: input.type,
          cardType: input.cardType, // Store card type
          design: {
            cardType: input.cardType,
            logo: input.logo,
            icon: input.icon,
            backgroundColor: input.backgroundColor || '#59341C',
            textColor: input.textColor || '#FFFFFF',
            accentColor: input.accentColor || '#FF8C00',
            layout: 'storeCard', // All cards use storeCard layout
          },
          settings: {
            expiration: input.expiration,
            language: input.language,
            rewardDetails: input.rewardDetails,
            terms: input.terms,
            description: input.description,
            businessName: input.businessName,
            // Card-type-specific settings
            stampCount: input.stampCount,
            pointsRate: input.pointsRate,
            discountTiers: input.discountTiers,
            discountPercentage: input.discountPercentage,
            cashbackPercentage: input.cashbackPercentage,
            balance: input.balance,
            classesPerMonth: input.classesPerMonth,
            // Platform preferences
            platformPreferences: {
              appleWallet: input.platformAppleWallet ?? true,
              googleWallet: input.platformGoogleWallet ?? true,
              pwa: input.platformPWA ?? false,
            },
          },
          active: input.active,
        }).returning();

        return { success: true, card: cardTemplate };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create card',
        });
      }
    }),

  // Get all cards for a client
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Get client for this user
        const userClient = await db.query.client.findFirst({
          where: eq(client.userId, ctx.user.id),
        });

        // For admin users, get all cards (or cards without clientId filter)
        if (ctx.user.role === 'admin') {
          return await db.query.passTemplates.findMany({
            orderBy: (templates, { desc }) => [desc(templates.createdAt)],
          });
        }

        // For non-admin users, they need a client record
        if (!userClient) {
          return [];
        }

        const clientId = userClient.id;

        const templates = await db.query.passTemplates.findMany({
          where: eq(passTemplates.clientId, clientId),
          orderBy: (templates, { desc }) => [desc(templates.createdAt)],
        });

        return templates || [];
      } catch (error) {
        console.error('Error fetching cards:', error);
        return [];
      }
    }),

  // Get card by ID (PUBLIC - No authentication required)
  // This endpoint is used for customer registration flow
  // Anyone with a valid card ID can access this endpoint
  // Per PRD 2.2.3: Customer scans QR code or clicks link -> Registration form appears
  getByIdPublic: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const card = await db.query.passTemplates.findFirst({
        where: eq(passTemplates.id, input.id),
      });

      if (!card) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Card not found',
        });
      }

      // Only return active cards for public registration
      // Inactive cards should not accept new customer registrations
      if (!card.active) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This card is not currently accepting new registrations',
        });
      }

      return card;
    }),

  // Get card by ID (protected - for admin/client access)
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const card = await db.query.passTemplates.findFirst({
        where: eq(passTemplates.id, input.id),
      });

      if (!card) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Card not found',
        });
      }

      // Check permissions
      const userClient = await db.query.client.findFirst({
        where: eq(client.userId, ctx.user.id),
      });

      if (card.clientId !== userClient?.id && ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this card',
        });
      }

      return card;
    }),

  // Update card
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: cardUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const card = await db.query.passTemplates.findFirst({
        where: eq(passTemplates.id, input.id),
      });

      if (!card) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Card not found',
        });
      }

      // Check permissions
      const userClient = await db.query.client.findFirst({
        where: eq(client.userId, ctx.user.id),
      });

      if (card.clientId !== userClient?.id && ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this card',
        });
      }

      // Merge design and settings
      const updatedDesign = {
        ...((card.design as any) || {}),
        ...(input.data.logo !== undefined && { logo: input.data.logo }),
        ...(input.data.icon !== undefined && { icon: input.data.icon }),
        ...(input.data.backgroundColor !== undefined && { backgroundColor: input.data.backgroundColor }),
        ...(input.data.textColor !== undefined && { textColor: input.data.textColor }),
        ...(input.data.accentColor !== undefined && { accentColor: input.data.accentColor }),
      };

      const updatedSettings = {
        ...((card.settings as any) || {}),
        ...(input.data.expiration !== undefined && { expiration: input.data.expiration }),
        ...(input.data.language !== undefined && { language: input.data.language }),
        ...(input.data.rewardDetails !== undefined && { rewardDetails: input.data.rewardDetails }),
        ...(input.data.terms !== undefined && { terms: input.data.terms }),
        ...(input.data.description !== undefined && { description: input.data.description }),
        ...(input.data.businessName !== undefined && { businessName: input.data.businessName }),
      };

      const [updated] = await db.update(passTemplates)
        .set({
          name: input.data.name || card.name,
          type: input.data.type || card.type,
          design: updatedDesign,
          settings: updatedSettings,
          active: input.data.active !== undefined ? input.data.active : card.active,
          updatedAt: new Date(),
        })
        .where(eq(passTemplates.id, input.id))
        .returning();

      return { success: true, card: updated };
    }),

  // Delete card
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const card = await db.query.passTemplates.findFirst({
        where: eq(passTemplates.id, input.id),
      });

      if (!card) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Card not found',
        });
      }

      // Check permissions
      const userClient = await db.query.client.findFirst({
        where: eq(client.userId, ctx.user.id),
      });

      if (card.clientId !== userClient?.id && ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this card',
        });
      }

      await db.delete(passTemplates)
        .where(eq(passTemplates.id, input.id));

      return { success: true };
    }),

  // Activate card
  activate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const card = await db.query.passTemplates.findFirst({
        where: eq(passTemplates.id, input.id),
      });

      if (!card) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Card not found',
        });
      }

      // Check permissions
      const userClient = await db.query.client.findFirst({
        where: eq(client.userId, ctx.user.id),
      });

      if (card.clientId !== userClient?.id && ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this card',
        });
      }

      const [updated] = await db.update(passTemplates)
        .set({
          active: true,
          updatedAt: new Date(),
        })
        .where(eq(passTemplates.id, input.id))
        .returning();

      return { success: true, card: updated };
    }),

  // Generate QR code and distribution link
  generateDistribution: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const card = await db.query.passTemplates.findFirst({
        where: eq(passTemplates.id, input.id),
      });

      if (!card) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Card not found',
        });
      }

      // Generate unique registration link
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
      
      const registrationLink = `${baseUrl}/register/${card.id}`;
      
      // QR code will be generated on the frontend using a library
      // For now, return the link

      return {
        registrationLink,
        qrCodeData: registrationLink, // Frontend will generate QR from this
      };
    }),
});

