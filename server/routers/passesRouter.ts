/**
 * Passes Router
 * 
 * Handles pass-related operations including updates
 */

import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/db/drizzle";
import { userPasses, passUpdates, passRegistrations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePass, generateGooglePass } from "@/app/utils/pass-generation/pass-generation";
import { detectPlatform } from "@/modules/pass-generation";
import { v4 as uuidv4 } from "uuid";

export const passesRouter = router({
  // Update pass (add stamps, points, etc.)
  updatePass: protectedProcedure
    .input(
      z.object({
        passId: z.string().uuid(),
        stampCount: z.number().min(0).optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Find the pass
      const pass = await db.query.userPasses.findFirst({
        where: eq(userPasses.id, input.passId),
      });

      if (!pass) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pass not found',
        });
      }

      // Update pass metadata
      const updatedMetadata = {
        ...((pass.metadata as any) || {}),
        ...(input.metadata || {}),
        stampCount: input.stampCount ?? (pass.metadata as any)?.stampCount ?? 0,
        updatedAt: new Date().toISOString(),
      };

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

      return { success: true };
    }),

  // Get pass by serial number
  getPassBySerial: protectedProcedure
    .input(z.object({ serialNumber: z.string() }))
    .query(async ({ input }) => {
      const pass = await db.query.userPasses.findFirst({
        where: eq(userPasses.serialNumber, input.serialNumber),
      });

      if (!pass) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pass not found',
        });
      }

      return pass;
    }),

  // Get all passes for a user
  getUserPasses: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await db.query.userPasses.findMany({
        where: eq(userPasses.userId, input.userId),
      });
    }),

  // Get pass registrations (for push notifications)
  getPassRegistrations: adminProcedure
    .input(z.object({ passId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await db.query.passRegistrations.findMany({
        where: eq(passRegistrations.passId, input.passId),
      });
    }),

  // Generate test pass with default assets (admin only)
  // Uses the same logic as Registration route - creates a test user and uses generatePass
  generateTestPass: adminProcedure
    .input(
      z.object({
        cardType: z.enum(["stamp", "points", "discount", "cashback", "multipass", "coupon", "reward", "membership", "gift"]),
        stampCount: z.number().min(2).max(50).optional().default(10),
        initialStamps: z.number().min(0).optional().default(0),
        pointsRate: z.number().min(1).max(10).optional(),
        pointsBalance: z.number().min(0).optional(),
        discountTiers: z.array(z.number()).optional(),
        discountPercentage: z.number().min(0).max(100).optional(),
        cashbackPercentage: z.number().min(0).max(100).optional(),
        cashbackEarned: z.number().min(0).optional(),
        balance: z.number().min(0).optional(),
        visits: z.number().min(0).optional(),
        classesPerMonth: z.number().min(0).optional(),
        expirationDate: z.string().optional(),
        offerDescription: z.string().optional(),
        backgroundColor: z.string(),
        textColor: z.string(),
        accentColor: z.string(),
        cardTitle: z.string(),
        businessName: z.string(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        expiration: z.enum(["unlimited", "timeRange"]),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        platform: z.enum(['ios', 'android', 'unknown']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Detect platform from User-Agent if platform is unknown (same as users.create)
        let detectedPlatform = input.platform;
        
        // Try to get User-Agent from context
        let userAgent = '';
        if (ctx?.headers?.['user-agent']) {
          userAgent = ctx.headers['user-agent'];
        } else if (ctx?.req?.headers?.get) {
          userAgent = ctx.req.headers.get('user-agent') || '';
        }
        
        // If platform is unknown, detect from User-Agent
        if (detectedPlatform === 'unknown' && userAgent) {
          const platformDetection = detectPlatform(userAgent);
          if (platformDetection !== 'unknown') {
            detectedPlatform = platformDetection;
          }
        }
        
        // If still unknown, try comprehensive detection
        if (detectedPlatform === 'unknown' && userAgent) {
          const userAgentLower = userAgent.toLowerCase();
          if (
            userAgentLower.includes('iphone') ||
            userAgentLower.includes('ipad') ||
            userAgentLower.includes('ipod') ||
            (userAgentLower.includes('mac') && userAgentLower.includes('mobile')) ||
            userAgentLower.includes('like mac os x')
          ) {
            detectedPlatform = 'ios';
          } else if (userAgentLower.includes('android')) {
            detectedPlatform = 'android';
          }
        }
        
        // Fallback: if still unknown, default to iOS
        if (detectedPlatform === 'unknown') {
          detectedPlatform = 'ios';
        }

        // Create a test user (same as Registration route)
        // Generate unique values to avoid constraint violations
        const uniqueId = uuidv4();
        const testEmail = `test-${uniqueId}@test.com`;
        const testUsername = `Test User ${Date.now()}-${uniqueId.slice(0, 8)}`;
        // Generate unique phone number using timestamp and UUID
        const testPhone = `+1${Date.now().toString().slice(-10)}${uniqueId.slice(0, 2)}`;

        console.log('═════════════════════════════════════════════════════');
        console.log('🧪 TEST PASS GENERATION');
        console.log('═════════════════════════════════════════════════════');
        console.log('📥 INPUT VALUES RECEIVED:');
        console.log('   cardType:', input.cardType);
        console.log('   stampCount (threshold):', input.stampCount);
        console.log('   initialStamps:', input.initialStamps);
        console.log('   typeof initialStamps:', typeof input.initialStamps);
        console.log('═════════════════════════════════════════════════════');
        console.log('📝 Creating test user...');
        
        const userResult = await db.insert(users).values({
          username: testUsername,
          email: testEmail,
          phoneNumber: testPhone,
          role: 'customer',
        }).returning();

        const userId = userResult[0].id;
        const serialNumber = `COFFEE${userId}`;
        
        console.log('✅ Test user created');
        console.log('   User ID:', userId);
        console.log('   Username:', testUsername);
        console.log('   Email:', testEmail);
        console.log('   Phone:', testPhone);
        console.log('   Serial Number:', serialNumber);

        // Default assets from templates (using the URLs already in the project)
        const DEFAULT_ASSETS = {
          icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
          icon2x: 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
          logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
          logo2x: 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
          strip: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
          strip2x: 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
          strip3x: 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
          thumbnail: 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
          thumbnail2x: 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71',
        };

        // Prepare card data based on card type - MUST include all design fields to match preview
        // IMPORTANT: Use ?? instead of || to properly handle 0 values
        const initialStampsValue = input.initialStamps ?? 0;
        const stampThresholdValue = input.stampCount ?? 10;
        
        console.log('📊 CARD DATA VALUES:');
        console.log('   initialStampsValue (stampCount for pass):', initialStampsValue);
        console.log('   stampThresholdValue (total needed):', stampThresholdValue);
        
        const cardData = {
          // Visual design fields - these MUST match the preview
          cardTitle: input.cardTitle,
          businessName: input.businessName,
          subtitle: input.subtitle,
          description: input.description,
          backgroundColor: input.backgroundColor,
          textColor: input.textColor,
          accentColor: input.accentColor,
          // Asset URLs - use default assets like the preview
          logo: DEFAULT_ASSETS.logo,
          icon: DEFAULT_ASSETS.icon,
          strip: DEFAULT_ASSETS.strip,
          // Card type specific fields - stampCount is the CURRENT stamps (initialStamps from UI)
          stampCount: initialStampsValue,
          stampThreshold: stampThresholdValue,
          rewardsCollected: 0,
          pointsBalance: input.pointsBalance ?? initialStampsValue,
          pointsRate: input.pointsRate ?? 1,
          discountPercentage: input.discountPercentage ?? 0,
          cashbackPercentage: input.cashbackPercentage ?? 0,
          cashbackEarned: input.cashbackEarned ?? 0,
          balance: input.balance ?? 0,
          visits: input.visits ?? 0,
          classesPerMonth: input.classesPerMonth ?? 0,
          expirationDate: input.expirationDate || input.endDate,
          offerDescription: input.offerDescription,
        };
        
        console.log('📊 CARD DATA OBJECT:');
        console.log('   cardData.stampCount:', cardData.stampCount);
        console.log('   cardData.stampThreshold:', cardData.stampThreshold);

        // Create userPass record (same as Registration route)
        console.log('📝 Creating pass record in database...');
        console.log('   Saving stampCount to metadata:', initialStampsValue);
        const [userPass] = await db.insert(userPasses).values({
          userId: userId,
          templateId: null,
          serialNumber: serialNumber,
          status: 'active',
          metadata: {
            stampCount: initialStampsValue, // Use the correctly parsed value
            stampThreshold: stampThresholdValue,
            createdAt: new Date().toISOString(),
            cardType: input.cardType,
            cardTitle: input.cardTitle,
            businessName: input.businessName,
            ...cardData,
          },
        }).returning();
        
        console.log('✅ Pass record created in database');
        console.log('   Pass ID:', userPass.id);
        console.log('   Serial Number:', userPass.serialNumber);
        console.log('   User ID:', userPass.userId);
        console.log('   Status:', userPass.status);
        console.log('   Card Type:', input.cardType);
        console.log('   Stamps in DB (initialStamps):', initialStampsValue);
        console.log('   Stamp Threshold in DB:', stampThresholdValue);
        console.log('   Metadata stampCount:', (userPass.metadata as any)?.stampCount);
        console.log('═════════════════════════════════════════════════════');

        let passBuffer;
        
        if (detectedPlatform === 'ios') {
          // Use the same generatePass function as Registration route
          // Pass card type and card data for storeCard generation
          console.log('📱 Calling generatePass with:');
          console.log('   userId:', userId);
          console.log('   stampCount param:', initialStampsValue);
          console.log('   cardType:', input.cardType);
          console.log('   cardData.stampCount:', cardData.stampCount);
          
          passBuffer = await generatePass(
            userId, 
            initialStampsValue, // Use the correctly parsed value
            input.cardType,
            cardData
          );

          // Validate buffer - ensure it's a Buffer instance
          if (!passBuffer || !Buffer.isBuffer(passBuffer)) {
            throw new Error('Generated pass buffer is invalid');
          }

          if (passBuffer.length === 0) {
            throw new Error('Generated pass buffer is empty');
          }

          // Log first few bytes for debugging (pkpass should be a ZIP file starting with PK)
          const firstBytes = Array.from(passBuffer.slice(0, 4)).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' ');
          console.log('Pass buffer first 4 bytes:', firstBytes, 'Expected: 0x50 0x4b (PK) for ZIP file');
          
          // Validate it's a valid ZIP file (pkpass is a ZIP archive)
          // Check for ZIP file signature: PK (0x504B) - but be lenient as some generators might have different structure
          if (passBuffer.length >= 2 && (passBuffer[0] !== 0x50 || passBuffer[1] !== 0x4B)) {
            console.warn('Warning: Pass buffer does not start with ZIP signature (PK). First bytes:', firstBytes);
            // Don't throw error, just warn - let the client try to open it
          }

          // Convert buffer to base64 (same as Registration route)
          const base64Pass = passBuffer.toString('base64');

          // Validate base64 string
          if (!base64Pass || base64Pass.length === 0) {
            throw new Error('Base64 conversion failed');
          }

          console.log('═════════════════════════════════════════════════════');
          console.log('✅ TEST PASS GENERATED SUCCESSFULLY');
          console.log('═════════════════════════════════════════════════════');
          console.log('📊 Buffer size:', passBuffer.length, 'bytes');
          console.log('📊 Base64 length:', base64Pass.length, 'characters');
          console.log('🎫 Serial Number:', serialNumber);
          console.log('👤 User ID:', userId);
          console.log('📱 Platform:', detectedPlatform);
          console.log('═════════════════════════════════════════════════════');
          console.log('💡 NEXT STEPS:');
          console.log('1. Download the .pkpass file');
          console.log('2. Add to Apple Wallet');
          console.log('3. Apple Wallet will send registration request to:');
          console.log(`   POST ${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL}/api/passes/v1/devices/{deviceId}/registrations/pass.com.dopecard.passmaker/${serialNumber}`);
          console.log('4. Check server logs for registration success');
          console.log('5. Open scanner and search for user to see device count');
          console.log('═════════════════════════════════════════════════════');

          return {
            buffer: base64Pass,
            mimeType: "application/vnd.apple.pkpass",
            userId: userId, // Include for debugging
            serialNumber: serialNumber, // Include for debugging
          };
        } else if (detectedPlatform === 'android') {
          // Pass card type and card data for Google Wallet generation
          passBuffer = await generateGooglePass(
            userId, 
            input.initialStamps || 0,
            input.cardType,
            cardData
          );
          return {
            buffer: passBuffer.toString('utf-8'), // For Google Pass URL
          };
        }
        
        throw new Error("Platform not detected");
      } catch (error) {
        console.error("Error generating test pass:", error);
        throw new Error(`Failed to generate test pass: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
});

