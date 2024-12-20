import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import db from "@/db/drizzle"; // Your DB connection file
import { passRegistrations ,users } from "@/db/schema"; // Import the users schema
//import { generatePass } from '@/utils/pass-generation/pass-generation';
import { generatePass } from '../../app/utils/pass-generation/pass-generation';
import path from 'path';


export const usersRouter = router({
  create: publicProcedure.input(
    z.object({
      username: z.string(),
      email: z.string().email(),
      phoneNumber: z.string(),
    })
  ).mutation(async ({ input }) => {
    console.log("Input received:", input); // Log the received input

    try {
      // Debugging: Ensure input data before attempting DB insert
      console.log("Inserting into database:", {
        username: input.username,
        email: input.email,
        phoneNumber: input.phoneNumber,
      });

      // Perform the database insertion
      const result = await db.insert(users).values({
        username: input.username,
        email: input.email,
        phoneNumber: input.phoneNumber,
      });

      console.log('start initiating pass')
      const passFilePath = await generatePass('sdsds'); // Call the pass generation function
      const fileName = path.basename(passFilePath);

      console.log("Pass generated at:", passFilePath);

      

      // Debugging: Log successful insert result
      console.log("Insert result:", result);

      return { 
        user: result, 
        passFilePath: `/passes/${fileName}`
      }; // Return something meaningful, like the inserted user data
    } catch (error) {
      console.error("Error during database insertion:", error); // Log the error

      // Return an error response, or rethrow the error depending on your error handling strategy
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
      const result = await passRegistrations.insert(input);
      return result;
    }),
});




 





 



  




  


























