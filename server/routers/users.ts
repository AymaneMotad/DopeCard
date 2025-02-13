import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import db from "@/db/drizzle";
import { passRegistrations, users } from "@/db/schema";
import { generatePass, generateGooglePass } from '../../app/utils/pass-generation/pass-generation';
import { v4 as uuidv4 } from 'uuid';
import { utapi } from "../../server/uploadthing";


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
                let passBuffer;
                if(input.platform === 'ios'){
                  console.log('Start initiating iOS pass');
                    console.time('generatePass');
                    
                    try {
                        console.log('Start Generating pass');
                        passBuffer = await generatePass(userId, 4);
                        console.log('Finished generating pass');
                    } catch (error) {
                        console.error('Error generating the pass:', error);
                        throw new Error('Failed to generate the pass');
                    }
                    
                    console.timeEnd('generatePass');
                    console.log('Pass buffer size:', passBuffer.length);

                    const fileName = `pass-${uuidv4()}.pkpass`;
                    // Create a Blob from the buffer
                    const blob = new Blob([passBuffer], { type: 'application/vnd.apple.pkpass' });
                      // Create a FileEsque object manually
                    const fileEsque = Object.assign(blob, {
                        name: fileName,
                        lastModified: Date.now(),
                        customId: userId.toString(), // Optional custom ID
                    });
                   console.log('FileEsque log', fileEsque);
                    console.log('Preparing to upload to UploadThing');

                        // Upload the file using UTApi
                    let response;
                    
                    try {
                         response = await utapi.uploadFiles([fileEsque]); // Pass as an array
                         console.log('UploadThing response:', response);

                        if (!response || !response[0] || !response[0].data?.url) {
                            throw new Error('Failed to upload file');
                        }

                       const downloadLink = response[0].data.appUrl;
                      console.log('download link is', downloadLink)

                        return {
                            user: userResult[0],
                            downloadLink,
                            passBuffer,
                        };
                    } catch (uploadError) {
                         console.error("Error during file upload:", uploadError);
                         throw new Error("Failed to upload pass");
                   }
                } else if (input.platform === 'android'){
                  console.log('Start initiating Android pass');
                   try {
                       console.log('Start generating Google Pass');
                       passBuffer = await generateGooglePass(userId, 4);
                       console.log('Finished generating Google Pass');
                         return {
                             user: userResult[0],
                            passBuffer,
                       };
                    } catch (error) {
                       console.error('Error generating the google pass', error);
                        throw new Error('Failed to generate the google pass');
                     }
                 }else if(input.platform === 'unknown'){
                   throw new Error("Platform not detected")
                 }

             } catch (error) {
                 console.error("Error during database insertion or upload:", error);
                 throw new Error("Failed to create user in the database or upload pass");
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