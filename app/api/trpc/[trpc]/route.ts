import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@/server";

const handler = async (req: Request) => {
//  console.log("Incoming request URL:", req.url); // Log the request URL

  // Call the fetchRequestHandler and return the result to handle the request properly
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
};
export { handler as GET, handler as POST };


