import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { publicProcedure as _publicProcedure, router, TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { getUserById } from './db/utils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
  const token = opts.req.headers.authorization?.replace('Bearer ', '');
  let user: User | null = null;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      const dbUser = await getUserById(decoded.userId);
      
      if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          dateOfBirth: dbUser.dateOfBirth,
          gender: dbUser.gender,
          profilePicture: dbUser.profilePicture,
          createdAt: dbUser.createdAt,
          lastLoginAt: dbUser.lastLoginAt,
        };
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