import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { publicProcedure as _publicProcedure, router, TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '../db/config';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'your-secret-key';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePicture?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
}

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function createContext(opts: CreateNextContextOptions) {
  const authHeader = opts.req.headers.authorization;
  const supabaseAuthHeader = opts.req.headers['x-supabase-auth'] as string;
  const token = authHeader?.replace('Bearer ', '') || supabaseAuthHeader;
  
  let user: User | null = null;
  
  if (token) {
    try {
      // First try to verify with Supabase
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (supabaseUser && !error) {
        // Get or create user in our database
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, supabaseUser.id))
          .limit(1);
        
        if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.firstName || undefined,
            lastName: dbUser.lastName || undefined,
            dateOfBirth: dbUser.dateOfBirth || undefined,
            gender: dbUser.gender || undefined,
            profilePicture: dbUser.profilePicture || undefined,
            createdAt: dbUser.createdAt,
            lastLoginAt: dbUser.lastLoginAt || undefined,
          };
        } else if (!dbUser) {
          // Create user in our database if they don't exist
          const [newUser] = await db
            .insert(users)
            .values({
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              firstName: supabaseUser.user_metadata?.firstName,
              lastName: supabaseUser.user_metadata?.lastName,
              isEmailVerified: supabaseUser.email_confirmed_at !== null,
              passwordHash: '', // Not needed for Supabase users
            })
            .returning();
          
          if (newUser) {
            user = {
              id: newUser.id,
              email: newUser.email,
              firstName: newUser.firstName || undefined,
              lastName: newUser.lastName || undefined,
              dateOfBirth: newUser.dateOfBirth || undefined,
              gender: newUser.gender || undefined,
              profilePicture: newUser.profilePicture || undefined,
              createdAt: newUser.createdAt,
              lastLoginAt: newUser.lastLoginAt || undefined,
            };
          }
        }
      } else {
        // Fallback to JWT verification for legacy tokens
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, decoded.userId))
            .limit(1);
          
          if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
            user = {
              id: dbUser.id,
              email: dbUser.email,
              firstName: dbUser.firstName || undefined,
              lastName: dbUser.lastName || undefined,
              dateOfBirth: dbUser.dateOfBirth || undefined,
              gender: dbUser.gender || undefined,
              profilePicture: dbUser.profilePicture || undefined,
              createdAt: dbUser.createdAt,
              lastLoginAt: dbUser.lastLoginAt || undefined,
            };
          }
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError);
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // user remains null
    }
  }

  return {
    user,
    req: opts.req,
    res: opts.res,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

export const publicProcedure = _publicProcedure.use(async ({ ctx, next }) => {
  return next({
    ctx,
  });
});

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export { router };
export const createTRPCRouter = router;