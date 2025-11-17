/**
 * PDF Router
 * 
 * Handles PDF generation for card distribution
 */

import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generatePDFHTML, generateBusinessSlug } from "@/app/utils/pdf-generator-server";

export const pdfRouter = router({
  // Generate PDF for a card
  generateCardPDF: protectedProcedure
    .input(
      z.object({
        cardId: z.string().uuid().optional(),
        cardTitle: z.string(),
        businessName: z.string(),
        cardType: z.string(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        description: z.string().optional(),
        registrationLink: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Generate unique business slug if registration link not provided
        const registrationLink = input.registrationLink || 
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register/${generateBusinessSlug(input.businessName, input.cardType)}`;

        // Generate PDF HTML
        const pdfHTML = await generatePDFHTML({
          cardTitle: input.cardTitle,
          businessName: input.businessName,
          registrationLink,
          backgroundColor: input.backgroundColor || '#59341C',
          textColor: input.textColor || '#FFFFFF',
          description: input.description,
          cardType: input.cardType,
          businessSlug: generateBusinessSlug(input.businessName, input.cardType),
        });

        return {
          success: true,
          html: pdfHTML,
          registrationLink,
          businessSlug: generateBusinessSlug(input.businessName, input.cardType),
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to generate PDF: ${error.message}`,
        });
      }
    }),
});

