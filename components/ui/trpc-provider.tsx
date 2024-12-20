"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

import { trpc } from "../../server/client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // In browser
      return '';
    }
    if (process.env.VERCEL_URL) {
      // In Vercel
      return `https://${process.env.VERCEL_URL}`;
    }
    return `http://localhost:${process.env.PORT ?? 3000}`; // Fallback for local dev
  };

  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(
    trpc.createClient({
      links: [
        httpBatchLink({
          //url: `${process.env.NEXT_PUBLIC_APP_URL}/api/trpc`,
          url: `${getBaseUrl()}/api/trpc`,
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