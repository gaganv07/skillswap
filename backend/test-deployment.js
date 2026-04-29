#!/usr/bin/env node

/**
 * DEPLOYMENT VALIDATION SCRIPT
 * Tests if the server can start successfully with proper environment validation
 */

require('dotenv').config();

console.log('🧪 DEPLOYMENT VALIDATION TEST');
console.log('================================');

// Test 1: Environment Variables
console.log('\n1️⃣  TESTING ENVIRONMENT VARIABLES...');

const required = ['MONGO_URI', 'JWT_SECRET'];
const optional = ['CLOUDINARY_CLOUD_NAME', 'OPENAI_API_KEY'];

let hasErrors = false;

required.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ MISSING REQUIRED: ${key}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${key}: Set`);
  }
});

optional.forEach(key => {
  if (!process.env[key]) {
    console.log(`⚠️  ${key}: Not set (optional)`);
  } else {
    console.log(`✅ ${key}: Set`);
  }
});

if (hasErrors) {
  console.error('\n💥 CRITICAL: Missing required environment variables!');
  console.error('Set these in your Render environment variables.');
  process.exit(1);
}

// Test 2: Import Validation
console.log('\n2️⃣  TESTING MODULE IMPORTS...');

try {
  const app = require('./src/app');
  const connectDB = require('./src/config/db');
  const env = require('./src/config/env');
  const setupSocket = require('./src/socket/socketHandler');

  console.log('✅ All modules imported successfully');
} catch (error) {
  console.error('❌ Import error:', error.message);
  process.exit(1);
}

// Test 3: Database Connection Test
console.log('\n3️⃣  TESTING DATABASE CONNECTION...');

const connectDB = require('./src/config/db');

connectDB()
  .then(() => {
    console.log('✅ Database connection successful');

    // Test 4: Server Creation Test
    console.log('\n4️⃣  TESTING SERVER CREATION...');

    const http = require('http');
    const app = require('./src/app');
    const setupSocket = require('./src/socket/socketHandler');

    const server = http.createServer(app);
    const io = setupSocket(server);
    app.locals.io = io;

    console.log('✅ Server and Socket.IO created successfully');

    // Test 5: Port Binding Test
    console.log('\n5️⃣  TESTING PORT BINDING...');

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);

      // Success!
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('================================');
      console.log('✅ Server is ready for deployment');
      console.log('✅ Environment variables validated');
      console.log('✅ Database connection working');
      console.log('✅ Socket.IO configured');
      console.log('✅ No startup errors detected');
      console.log('================================');

      // Close server after test
      server.close(() => {
        console.log('🛑 Test server closed');
        process.exit(0);
      });
    });

    server.on('error', (error) => {
      console.error('❌ Server startup error:', error.message);
      process.exit(1);
    });

  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.error('Check your MONGO_URI environment variable');
    process.exit(1);
  });