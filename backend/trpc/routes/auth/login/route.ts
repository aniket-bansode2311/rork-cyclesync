import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail, updateUserLastLogin } from '../../../db/utils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }))
  .mutation(async ({ input }) => {
    try {
      // Get user by email
      const user = await getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Check if account is active
      if (!user.isActive || user.deletedAt) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Account is deactivated',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Update last login
      await updateUserLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          lastLoginAt: new Date(),
        },
        token,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Login failed',
      });
    }
  });