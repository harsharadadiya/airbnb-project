// Opens (and closes) the connection to MongoDB using Mongoose.
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('🔁 MongoDB reconnected'));

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // give up after 10 seconds if MongoDB is not reachable
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('\n❌ Could not connect to MongoDB.');
    console.error(`   Reason: ${error.message}`);
    console.error('   Check that MongoDB is running and MONGODB_URI in server/.env is correct.\n');
    process.exit(1);
  }
}

export async function disconnectDB() {
  mongoose.connection.removeAllListeners('disconnected'); // we are closing on purpose, no warning needed
  await mongoose.connection.close();
}
