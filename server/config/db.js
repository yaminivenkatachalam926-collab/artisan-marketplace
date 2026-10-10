const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Use system default if setServers is restricted
}

let mongodInstance = null;

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/artisan_marketplace';
  const isCloudUri = uri.includes('mongodb+srv') || uri.includes('@');
  
  // 1. Try connecting to configured URI (e.g. MongoDB Atlas Cloud or running local MongoDB)
  try {
    const timeout = isCloudUri ? 12000 : 2500;
    await mongoose.connect(uri, { serverSelectionTimeoutMS: timeout });
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`✓ Connected to MongoDB Atlas Cloud: ${maskedUri}`);
  } catch (err) {
    console.warn(`External/Atlas MongoDB not reachable (${err.message}). Starting local embedded MongoDB service on port 27017...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      try {
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbName: 'artisan_marketplace',
          },
        });
      } catch (portErr) {
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'artisan_marketplace',
          },
        });
      }

      const activeUri = mongodInstance.getUri();
      await mongoose.connect(activeUri);
      console.log(`✓ Connected to local MongoDB service: ${activeUri}`);
    } catch (memErr) {
      console.error('Failed to start local database service:', memErr);
      process.exit(1);
    }
  }

  // 2. Auto-seed if database is empty
  try {
    const seedDB = require('../seed');
    await seedDB();
  } catch (seedErr) {
    console.warn('Auto-seed note:', seedErr.message);
  }
};
