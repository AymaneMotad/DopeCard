import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { passRegistrations, users, userPasses, passTemplates } from "@/db/schema";
import { generatePass, generateGooglePass } from '../../app/utils/pass-generation/pass-generation';
import { detectPlatform } from '@/modules/pass-generation';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

export const usersRouter = router({
    // Create user (PUBLIC - No authentication required)
    // This endpoint is used for customer registration flow
    // Anyone can register with name, email, phone number - no password required
    // Per PRD 2.2.1: Customer registration form collects name, email, phone
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
                
                // Get template or use provided one
                let template;
                if (input.templateId) {
                    template = await db.query.passTemplates.findFirst({
                        where: eq(passTemplates.id, input.templateId),
                    });
                }
                
                // If no template provided, throw error (card must exist)
                if (!template) {
                    throw new Error('Card template not found. Please scan a valid QR code.');
                }

                // Extract card data from template
                const cardType = template.cardType || 'stamp';
                const design = template.design as any || {};
                const settings = template.settings as any || {};
                
                // Get initial values from settings (new users start with 0, but threshold comes from settings)
                const initialStamps = settings.initialStamps ?? 0; // Start with initial stamps if set, otherwise 0
                const stampThreshold = settings.stampCount || 10; // Total stamps needed for reward
                
                // Log for debugging
                console.log('User registration - stamp values:', {
                    settingsInitialStamps: settings.initialStamps,
                    initialStamps,
                    settingsStampCount: settings.stampCount,
                    stampThreshold,
                    cardType,
                });
                const pointsBalance = settings.pointsBalance || 0;
                const pointsRate = settings.pointsRate || 1;
                const discountPercentage = settings.discountPercentage || 0;
                const discountTiers = settings.discountTiers || [];
                const cashbackPercentage = settings.cashbackPercentage || 0;
                const cashbackEarned = settings.cashbackEarned || 0;
                const balance = settings.balance || 0;
                const classesPerMonth = settings.classesPerMonth || 0;
                const visits = settings.visits || 0;
                const expirationDate = settings.expirationDate || settings.endDate || null;
                const offerDescription = settings.offerDescription || '';
                
                // Prepare card data for pass generation with all card-type-specific fields
                const cardData = {
                    cardTitle: template.name,
                    businessName: settings.businessName || design.businessName || 'Business',
                    subtitle: settings.subtitle || '',
                    description: settings.description || template.name,
                    backgroundColor: design.backgroundColor || '#59341C',
                    textColor: design.textColor || '#FFFFFF',
                    accentColor: design.accentColor || '#FF8C00',
                    // Include template assets
                    logo: design.logo,
                    icon: design.icon,
                    strip: design.strip,
                    // Stamp card fields
                    stampCount: initialStamps, // Current stamps
                    stampThreshold: stampThreshold, // Total stamps needed
                    rewardsCollected: 0, // Start with 0 rewards collected
                    // Points card fields
                    pointsBalance: pointsBalance,
                    pointsRate: pointsRate,
                    nextRewardThreshold: 100, // Default threshold
                    lifetimePoints: pointsBalance,
                    tier: 'Bronze', // Default tier
                    // Discount card fields
                    discountPercentage: discountPercentage,
                    discountTier: discountTiers.length > 0 ? 'Bronze' : 'None',
                    visits: visits,
                    // Cashback card fields
                    cashbackPercentage: cashbackPercentage,
                    cashbackEarned: cashbackEarned,
                    cashbackStatus: 'Bronze', // Default status
                    // Membership card fields
                    expirationDate: expirationDate,
                    classesPerMonth: classesPerMonth,
                    membershipType: 'Standard',
                    availableLimits: classesPerMonth,
                    // Coupon card fields
                    offerDescription: offerDescription,
                    // Gift card fields
                    balance: balance,
                    cardNumber: serialNumber, // Use serial number as card number
                    tagline: settings.tagline || '',
                };

                // Create userPass record with complete metadata
                const [userPass] = await db.insert(userPasses).values({
                    userId: userId,
                    templateId: template.id,
                    serialNumber: serialNumber,
                    status: 'active',
                    metadata: {
                        cardType: cardType,
                        stampCount: initialStamps,
                        stampThreshold: stampThreshold,
                        pointsBalance: pointsBalance,
                        pointsRate: pointsRate,
                        discountPercentage: discountPercentage,
                        discountTiers: discountTiers,
                        cashbackPercentage: cashbackPercentage,
                        cashbackEarned: cashbackEarned,
                        balance: balance,
                        classesPerMonth: classesPerMonth,
                        visits: visits,
                        expirationDate: expirationDate,
                        offerDescription: offerDescription,
                        rewardsCollected: 0,
                        createdAt: new Date().toISOString(),
                    },
                }).returning();

                let passBuffer;
                
                if (detectedPlatform === 'ios') {
                    // Log before pass generation
                    console.log('Generating iOS pass with:', {
                        userId,
                        initialStamps,
                        cardType,
                        cardDataStampCount: cardData.stampCount,
                        cardDataStampThreshold: cardData.stampThreshold,
                    });
                    
                    // Generate pass with card template data
                    passBuffer = await generatePass(
                        userId, 
                        initialStamps,
                        cardType,
                        cardData
                    );
                    
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
                    // Generate Google Pass with card template data
                    passBuffer = await generateGooglePass(
                        userId, 
                        initialStamps,
                        cardType,
                        cardData
                    );
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