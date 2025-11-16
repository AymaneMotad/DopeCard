/**
 * Cards Router
 * 
 * Handles card template creation and management
 */

import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/db/drizzle";
import { passTemplates, client } from "@/db/schema";
import { eq } from "drizzle-orm";

// Card creation input schema
const cardCreationSchema = z.object({
  // Section 1: Card Type
  type: z.enum(['stamp', 'points', 'discount']),
  
  // Section 2: Settings
  expiration: z.enum(['none', '30', '60', '90', '180', '365']).optional(),
  language: z.string().default('en'),
  
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
  
  // Section 5: Activation
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
        const userClient = await db.query.client.findFirst({
          where: eq(client.userId, ctx.user.id),
        });

        if (!userClient && ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only clients or admins can create cards',
          });
        }

        const clientId = userClient?.id || ctx.user.id; // Fallback for admin

        // Create card template
        const [cardTemplate] = await db.insert(passTemplates).values({
          clientId: clientId,
          name: input.name,
          type: input.type,
          design: {
            logo: input.logo,
            icon: input.icon,
            backgroundColor: input.backgroundColor || '#59341C',
            textColor: input.textColor || '#FFFFFF',
            accentColor: input.accentColor || '#FF8C00',
          },
          settings: {
            expiration: input.expiration,
            language: input.language,
            rewardDetails: input.rewardDetails,
            terms: input.terms,
            description: input.description,
            businessName: input.businessName,
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

  // Get card by ID
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

