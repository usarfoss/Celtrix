// Test setup file
import mongoose from 'mongoose';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup test database connection
beforeAll(async () => {
  // Use in-memory MongoDB for testing
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/mevn-auth-test';
  
  try {
    await mongoose.connect(mongoUri);
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection error:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
  console.log('Test database disconnected');
});
