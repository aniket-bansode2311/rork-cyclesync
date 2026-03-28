import { checkDatabaseConnection, closeDatabaseConnection } from './config';

async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful!');
    } else {
      console.log('❌ Database connection failed!');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('Connection test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Connection test failed:', error);
      process.exit(1);
    });
}

export { testConnection };