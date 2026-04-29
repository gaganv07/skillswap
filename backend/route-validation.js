#!/usr/bin/env node

/**
 * ROUTE VALIDATION SCRIPT
 * Checks if all route handlers are properly imported and defined
 */

require('dotenv').config();

console.log('🔍 ROUTE VALIDATION TEST');
console.log('========================');

// Test 1: Import all controllers
console.log('\n1️⃣  TESTING CONTROLLER IMPORTS...');

try {
  const authController = require('./src/controllers/authController');
  const userController = require('./src/controllers/userController');
  const chatController = require('./src/controllers/chatController');
  const groupController = require('./src/controllers/groupController');
  const mediaController = require('./src/controllers/mediaController');

  console.log('✅ All controllers imported successfully');
} catch (error) {
  console.error('❌ Controller import error:', error.message);
  process.exit(1);
}

// Test 2: Check specific functions
console.log('\n2️⃣  TESTING FUNCTION AVAILABILITY...');

const controllers = {
  authController: require('./src/controllers/authController'),
  userController: require('./src/controllers/userController'),
  chatController: require('./src/controllers/chatController'),
  groupController: require('./src/controllers/groupController'),
  mediaController: require('./src/controllers/mediaController'),
};

const requiredFunctions = {
  authController: ['register', 'login', 'getMe', 'refresh', 'logout'],
  userController: ['getUserProfile', 'updateProfile', 'getAllUsers', 'uploadProfilePic', 'enhanceBio', 'generateBio', 'generateEncryptionKeys', 'getPublicKey', 'aiChatAssistant'],
  chatController: ['getMessages', 'sendMessage', 'getRoomMessages', 'sendRoomMessage', 'markRoomAsRead', 'getChatRooms'],
  groupController: ['createGroup', 'getUserGroups', 'getGroup', 'addMember', 'removeMember', 'updateGroup', 'leaveGroup'],
  mediaController: ['uploadMedia', 'deleteMedia'],
};

let hasErrors = false;

for (const [controllerName, functions] of Object.entries(requiredFunctions)) {
  console.log(`\nChecking ${controllerName}:`);
  const controller = controllers[controllerName];

  for (const funcName of functions) {
    if (typeof controller[funcName] === 'function') {
      console.log(`  ✅ ${funcName}`);
    } else {
      console.log(`  ❌ ${funcName} - MISSING or not a function`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error('\n💥 CRITICAL: Missing route handler functions!');
  console.error('These functions must be defined and exported from their controllers.');
  process.exit(1);
}

// Test 3: Import route files
console.log('\n3️⃣  TESTING ROUTE FILE IMPORTS...');

try {
  const authRoutes = require('./src/routes/authRoutes');
  const userRoutes = require('./src/routes/userRoutes');
  const chatRoutes = require('./src/routes/chatRoutes');
  const groupRoutes = require('./src/routes/groupRoutes');
  const mediaRoutes = require('./src/routes/mediaRoutes');

  console.log('✅ All route files imported successfully');
} catch (error) {
  console.error('❌ Route import error:', error.message);
  process.exit(1);
}

console.log('\n🎉 ALL ROUTE VALIDATIONS PASSED!');
console.log('========================');
console.log('✅ No undefined route handlers');
console.log('✅ All controllers properly exported');
console.log('✅ All route files importable');
console.log('✅ Ready for deployment');