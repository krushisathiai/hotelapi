import app from './app.js';
import env from './config/env.js';
import { testConnection } from './config/database.js';

const startServer = async () => {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ Failed to connect to PostgreSQL. Please check your database configuration.');
    console.log('💡 Make sure PostgreSQL is running and the database "dineflow" exists.');
    console.log('   Create it with: CREATE DATABASE dineflow;');
    console.log('   Then run: psql -U postgres -d dineflow -f database/schema.sql');
    // Continue anyway so frontend can still be developed
  }

  app.listen(env.port, () => {
    console.log(`\n🍽️  DineFlow API Server`);
    console.log(`   Environment: ${env.nodeEnv}`);
    console.log(`   Port: ${env.port}`);
    console.log(`   URL: http://localhost:${env.port}`);
    console.log(`   Client: ${env.clientUrl}`);
    console.log(`   Database: ${dbConnected ? '✅ Connected' : '❌ Not connected'}\n`);
  });
};

startServer();
