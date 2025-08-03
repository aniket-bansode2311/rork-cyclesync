import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

// Retry logic with exponential backoff
const retryLink = (attempts: number = 3) => {
  return httpLink({
    url: `${getBaseUrl()}/api/trpc`,
    transformer: superjson,
    fetch: async (url, options) => {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          const response = await fetch(url, options);
          
          // If we get a 429, wait and retry
          if (response.status === 429) {
            if (attempt < attempts) {
              const retryAfter = response.headers.get('Retry-After');
              const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
              console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${attempts})`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          // If successful or non-retryable error, return response
          if (response.ok || response.status < 500) {
            return response;
          }
          
          // For 5xx errors, retry
          if (attempt < attempts) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Server error ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${attempts})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          return response;
        } catch (error) {
          lastError = error as Error;
          if (attempt < attempts) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Network error, retrying in ${delay}ms (attempt ${attempt}/${attempts}):`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }
      
      throw lastError || new Error('Max retries exceeded');
    },
  });
};

export const trpcClient = trpc.createClient({
  links: [retryLink(3)],
});