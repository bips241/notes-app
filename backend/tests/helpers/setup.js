const { connectDB, disconnectDB, clearDB } = require('./db-setup');
const jwt = require('jsonwebtoken');

// Global test setup
beforeAll(async () => {
  await connectDB();
});

// Global test teardown
afterAll(async () => {
  await disconnectDB();
});

// Clean up after each test
afterEach(async () => {
  await clearDB();
});

// Test helpers
global.testHelpers = {
  // Generate JWT token for testing
  generateToken: (userId, role = 'user') => {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },
  
  // Create test user data
  createTestUser: (overrides = {}) => ({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isActive: true,
    ...overrides
  }),
  
  // Create test note data
  createTestNote: (userId, overrides = {}) => ({
    title: 'Test Note',
    content: 'This is a test note content',
    tags: ['test', 'note'],
    owner: userId,
    sharedWith: [],
    isArchived: false,
    ...overrides
  }),
  
  // Create test admin user
  createTestAdmin: (overrides = {}) => ({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    ...overrides
  })
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '3001';
