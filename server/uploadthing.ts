// server/uploadthing.ts
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
    token: process.env.UPLOADTHING_TOKEN,
  //You can add more options here if needed in the future, like `fetch` if you are facing network issues
});