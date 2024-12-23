// server/routers/users.ts
import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import db from "@/db/drizzle";
import { passRegistrations, users } from "@/db/schema";
import { generatePass } from '../../app/utils/pass-generation/pass-generation';


export const usersRouter = router({
    create: publicProcedure
        .input(
            z.object({
                username: z.string(),
                email: z.string().email(),
                phoneNumber: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            console.log("Input received:", input);

            try {
            console.log("Inserting into database:", {
                username: input.username,
                email: input.email,
                phoneNumber: input.phoneNumber,
            });

            const userResult = await db.insert(users).values({
                username: input.username,
                email: input.email,
                phoneNumber: input.phoneNumber,
            }).returning();

            const userId = userResult[0].id;


            console.log('start initiating pass')
            const passBuffer = await generatePass(userId); // Generate the pass buffer
            console.log("Pass generated");


            return {
                user: userResult[0],
                passBuffer
            };
        } catch (error) {
            console.error("Error during database insertion:", error);
            throw new Error("Failed to create user in the database");
        }
    }),
    // Add a user pass
    addPass: publicProcedure
        .input(z.object({
            userId: z.string(),
            serialNumber: z.string(),
            pushToken: z.string(),
            deviceLibraryIdentifier: z.string(),
            platform: z.enum(['ios', 'android']),
        }))
        .mutation(async ({ input }) => {
            // Add pass registration logic here
            const result = await db.insert(passRegistrations).values(input).returning()
            return result;
        }),
});