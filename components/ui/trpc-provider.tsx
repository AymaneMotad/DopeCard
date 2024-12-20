"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

import { trpc } from "../../server/client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL as string) || "http://localhost:3000";
    const fullUrl = `${baseUrl}/api/trpc`;
    trpc.createClient({
      links: [
        httpBatchLink({
          //url: `${process.env.NEXT_PUBLIC_APP_URL}/api/trpc`,
          url: fullUrl
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}