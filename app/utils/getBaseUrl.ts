// utils/getBaseUrl.ts
export function getBaseUrl() {
    if (typeof window !== "undefined") {
      // Client-side: Use the environment variable or a default
      return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    } else {
      // Server-side: Use a default (or handle differently if needed)
      return "http://localhost:3000";
    }
  }