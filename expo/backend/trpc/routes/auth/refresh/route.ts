import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { getUserById } from '../../../db/utils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface RefreshTokenPayload {
  userId: string;
  type: string;
  iat?: number;
  exp?: number;
}

export const refreshTokenProcedure = publicProcedure
  .input(z.object({
    refreshToken: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      // Verify refresh token
      const decoded = jwt.verify(input.refreshToken, JWT_SECRET) as RefreshTokenPayload;
      
      if (decoded.type !== 'refresh') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid refresh token',
        });
      }

      // Get user
      const user = await getUserById(decoded.userId);
      if (!user || !user.isActive || user.deletedAt) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found or inactive',
        });
      }

      // Generate new access token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return {
        token,
        refreshToken: newRefreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid refresh token',
        });
      }
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Token refresh failed',
      });
    }
  });

export const logoutProcedure = publicProcedure
  .mutation(async () => {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    return { success: true, message: 'Logged out successfully' };
  });