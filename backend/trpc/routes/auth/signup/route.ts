import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from '../../../db/utils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const signupProcedure = publicProcedure
  .input(z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['female', 'male', 'non_binary', 'prefer_not_to_say']).optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      // Check if user already exists
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(input.password, saltRounds);

      // Create user
      const user = await createUser({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
      });

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
          createdAt: user.createdAt,
        },
        token,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      };
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create account',
      });
    }
  });