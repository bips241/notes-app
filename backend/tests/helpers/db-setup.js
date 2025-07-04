const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    
    console.log('Connected to in-memory MongoDB for testing');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('Disconnected from in-memory MongoDB');
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
  }
};

const clearDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing test database:', error);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  clearDB
};
