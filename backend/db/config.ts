import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';

// Database configuration - Using Supabase PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || 'postgresql://localhost:5432/cyclesync';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or SUPABASE_DATABASE_URL environment variable is required');
}

// Create the connection with Supabase-compatible settings
const queryClient = postgres(DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});

// Create the database instance
export const db = drizzle(queryClient, {
  schema: { ...schema, ...relations },
  logger: process.env.NODE_ENV === 'development',
});

// Export the query client for migrations
export { queryClient };

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await queryClient.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}