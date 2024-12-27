import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server";

const handler = async (req: Request) => {
  console.log('Incoming trpc request', req.url);

    // check if the request is for our mutation, and it's a POST request
    const isUsersCreate = req.url.includes("/api/trpc/users.create") && req.method === "POST";

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

   if(isUsersCreate) {
        console.log('setting content type header')
        response.headers.set('Content-Type', 'application/vnd.apple.pkpass');
        response.headers.set(
            'Content-Disposition',
            `attachment; filename=ADSK2D-pass.pkpass`,
        );
        console.log('Response headers', response.headers);
    }
    return response
};

export { handler as GET, handler as POST };