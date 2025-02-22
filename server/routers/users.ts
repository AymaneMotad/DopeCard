import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import db from "@/db/drizzle";
import { passRegistrations, users } from "@/db/schema";
import { generatePass, generateGooglePass } from '../../app/utils/pass-generation/pass-generation';
import { v4 as uuidv4 } from 'uuid';
// import { utapi } from "../../server/uploadthing"; // Removed UploadThing import


export const usersRouter = router({
    create: publicProcedure
        .input(
            z.object({
                username: z.string(),
                email: z.string().email(),
                phoneNumber: z.string(),
                platform: z.enum(['ios', 'android', 'unknown']) // Include platform
            })
        )
        .mutation(async ({ input }) => {
            try {
                const userResult = await db.insert(users).values({
                    username: input.username,
                    email: input.email,
                    phoneNumber: input.phoneNumber,
                }).returning();

                const userId = userResult[0].id;
                let passBuffer;
                
                if (input.platform === 'ios') {
                    passBuffer = await generatePass(userId, 4);
                    
                    // Convert buffer to base64
                    const base64Pass = passBuffer.toString('base64');
                    
                    return {
                        user: userResult[0],
                        passData: {
                            buffer: base64Pass,
                            mimeType: "application/vnd.apple.pkpass"
                        }
                    };
                } else if (input.platform === 'android') {
                    passBuffer = await generateGooglePass(userId, 4);
                    return {
                        user: userResult[0],
                        passData: {
                            buffer: passBuffer.toString('utf-8') // For Google Pass URL
                        }
                    };
                }
                
                throw new Error("Platform not detected");
            } catch (error) {
                console.error("Error:", error);
                throw new Error("Failed to create user or generate pass");
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