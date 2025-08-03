import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/cyclesync';

// Create the connection
const queryClient = postgres(DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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