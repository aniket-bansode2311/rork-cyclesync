import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

// Get auth headers for requests
const getAuthHeaders = async () => {
  try {
    // Try to get session from Supabase first
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'X-Supabase-Auth': session.access_token,
      };
    }
    
    // Fallback to AsyncStorage
    const token = await AsyncStorage.getItem('cyclesync_auth_token');
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'X-Auth-Token': token,
      };
    }
  } catch (error) {
    console.error('Error getting auth headers:', error);
  }
  
  return {};
};

// Retry logic with exponential backoff
const retryLink = (attempts: number = 3) => {
  return httpLink({
    url: `${getBaseUrl()}/api/trpc`,
    transformer: superjson,
    headers: async () => {
      const authHeaders = await getAuthHeaders();
      return {
        'Content-Type': 'application/json',
        ...authHeaders,
      };
    },
    fetch: async (url, options) => {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          // Ensure headers are included in the request
          const authHeaders = await getAuthHeaders();
          const headers = {
            'Content-Type': 'application/json',
            ...authHeaders,
            ...(options?.headers || {}),
          };
          
          const response = await fetch(url, {
            ...options,
            headers,
          });
          
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