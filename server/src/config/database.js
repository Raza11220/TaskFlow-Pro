import mongoose from 'mongoose';

let connectionPromise;

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;

  // Concurrent requests in a warm function share one connection attempt/pool.
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    }).finally(() => {
      connectionPromise = undefined;
    });
  }

  return connectionPromise;
};

export default connectDatabase;
