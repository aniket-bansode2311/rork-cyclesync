import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

const rateLimit = async (c: any, next: any) => {
  const clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const now = Date.now();
  
  const clientData = rateLimitMap.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize rate limit data
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
  } else {
    clientData.count++;
    
    if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
      const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
      c.header('Retry-After', retryAfter.toString());
      return c.json(
        { 
          error: 'Too Many Requests', 
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter 
        }, 
        429
      );
    }
  }
  
  // Add rate limit headers
  c.header('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
  c.header('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX_REQUESTS - (clientData?.count || 0)).toString());
  c.header('X-RateLimit-Reset', Math.ceil((clientData?.resetTime || now) / 1000).toString());
  
  await next();
};

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Apply rate limiting to all routes
app.use("*", rateLimit);

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
    onError: ({ error, path, type }) => {
      console.error(`tRPC Error on ${path} (${type}):`, error);
      
      // Log rate limiting errors specifically
      if (error.message.includes('Too Many Requests') || error.message.includes('429')) {
        console.warn(`Rate limiting triggered for path: ${path}`);
      }
    },
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "API is running",
    timestamp: new Date().toISOString(),
    rateLimit: {
      window: RATE_LIMIT_WINDOW,
      maxRequests: RATE_LIMIT_MAX_REQUESTS
    }
  });
});

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export default app;