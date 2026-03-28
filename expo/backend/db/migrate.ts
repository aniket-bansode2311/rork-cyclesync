import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, queryClient } from './config';
import { seedDatabase } from './seed';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Run migrations
    await migrate(db, { migrationsFolder: './backend/db/migrations' });
    
    console.log('Migrations completed successfully!');
    
    // Run seeding
    console.log('Starting database seeding...');
    await seedDatabase();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await queryClient.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

export { runMigrations };