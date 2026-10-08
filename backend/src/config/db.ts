import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });
  const { host, name } = mongoose.connection;
  console.log(`[db] connected to ${host}/${name}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
}