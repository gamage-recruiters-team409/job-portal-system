import mongoose from 'mongoose';

export async function connectDatabase(mongodbUri) {
  if (!mongodbUri) {
    console.warn('MONGODB_URI is not configured. Starting without a database connection.');
    return;
  }

  await mongoose.connect(mongodbUri);
  console.log('MongoDB connection established.');
}
