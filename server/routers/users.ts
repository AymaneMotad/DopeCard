import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { passRegistrations, users, userPasses, passTemplates } from "@/db/schema";
import { generatePass, generateGooglePass } from '../../app/utils/pass-generation/pass-generation';
import { detectPlatform } from '@/modules/pass-generation';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

export const usersRouter = router({
    create: publicProcedure
        .input(
            z.object({
                username: z.string(),
                email: z.string().email(),
                phoneNumber: z.string(),
                platform: z.enum(['ios', 'android', 'unknown']),
                templateId: z.string().uuid().optional(), // Optional template ID
            })
        )
        .mutation(async ({ input, ctx }) => {
            try {
                // Detect platform from User-Agent if platform is unknown
                let detectedPlatform = input.platform;
                
                // Debug logging
                console.log('Input platform:', input.platform);
                console.log('Context:', ctx);
                console.log('User-Agent from ctx:', ctx?.headers?.['user-agent']);
                
                // Try to get User-Agent from context
                let userAgent = '';
                if (ctx?.headers?.['user-agent']) {
                    userAgent = ctx.headers['user-agent'];
                } else if (ctx?.req?.headers?.get) {
                    // Try to get from request object if available
                    userAgent = ctx.req.headers.get('user-agent') || '';
                }
                
                console.log('Detected User-Agent:', userAgent);
                
                // If platform is unknown, detect from User-Agent
                if (detectedPlatform === 'unknown' && userAgent) {
                    const platformDetection = detectPlatform(userAgent);
                    if (platformDetection !== 'unknown') {
                        detectedPlatform = platformDetection;
                        console.log('Platform detected via detectPlatform:', detectedPlatform);
                    }
                }
                
                // If still unknown, try to detect from User-Agent using more comprehensive detection
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
                        console.log('Platform detected as iOS via comprehensive check');
                    } else if (userAgentLower.includes('android')) {
                        detectedPlatform = 'android';
                        console.log('Platform detected as Android via comprehensive check');
                    }
                }
                
                console.log('Final detected platform:', detectedPlatform);
                
                // Fallback: if still unknown, default to iOS (since content-type is set to Apple pkpass)
                if (detectedPlatform === 'unknown') {
                    console.log('Platform still unknown, defaulting to iOS');
                    detectedPlatform = 'ios';
                }
                
                // Create user
                const userResult = await db.insert(users).values({
                    username: input.username,
                    email: input.email,
                    phoneNumber: input.phoneNumber,
                    role: 'client', // Default role for customers
                }).returning();

                const userId = userResult[0].id;
                const serialNumber = `COFFEE${userId}`;
                
                // Get default template or use provided one
                let template;
                if (input.templateId) {
                    template = await db.query.passTemplates.findFirst({
                        where: eq(passTemplates.id, input.templateId),
                    });
                }
                
                // If no template, create a default one or use first available
                if (!template) {
                    // For now, we'll create a userPass without template
                    // In production, you'd want to ensure a template exists
                }

                // Create userPass record
                const [userPass] = await db.insert(userPasses).values({
                    userId: userId,
                    templateId: template?.id || null, // Will be set when card creation system is implemented
                    serialNumber: serialNumber,
                    status: 'active',
                    metadata: {
                        stampCount: 0,
                        createdAt: new Date().toISOString(),
                    },
                }).returning();

                let passBuffer;
                
                if (detectedPlatform === 'ios') {
                    passBuffer = await generatePass(userId, 0); // Start with 0 stamps
                    
                    // Convert buffer to base64
                    const base64Pass = passBuffer.toString('base64');
                    
                    return {
                        user: userResult[0],
                        pass: userPass,
                        passData: {
                            buffer: base64Pass,
                            mimeType: "application/vnd.apple.pkpass"
                        }
                    };
                } else if (detectedPlatform === 'android') {
                    passBuffer = await generateGooglePass(userId, 0);
                    return {
                        user: userResult[0],
                        pass: userPass,
                        passData: {
                            buffer: passBuffer.toString('utf-8') // For Google Pass URL
                        }
                    };
                }
                
                throw new Error("Platform not detected");
            } catch (error) {
                console.error("Error:", error);
                throw new Error(`Failed to create user or generate pass: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }),

    addPass: publicProcedure
        .input(z.object({
            userId: z.string(),
            serialNumber: z.string(),
            pushToken: z.string(),
            deviceLibraryIdentifier: z.string(),
            platform: z.enum(['ios', 'android']),
        }))
        .mutation(async ({ input }) => {
            const result = await db.insert(passRegistrations).values(input).returning();
            return result;
        }),
});