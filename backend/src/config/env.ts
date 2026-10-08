import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const here = path.dirname(fileURLToPath(import.meta.url));
/** Absolute path to the `server/` folder, independent of cwd. */
export const serverRoot = path.resolve(here, '..', '..');

function required(name: string, fallback?: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(
    `Missing required environment variable ${name}. Copy .env.example to .env and set it.`,
  );
}

function list(name: string, fallback: string): string[] {
  return required(name, fallback)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: required('NODE_ENV', 'development'),
  isProduction: required('NODE_ENV', 'development') === 'production',
  port: Number(required('PORT', '4000')),
  corsOrigins: list('CORS_ORIGIN', 'http://localhost:5173,http://localhost:5174'),
  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/shreeji_gifts'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: required('JWT_EXPIRES_IN', '7d'),
  uploadDir: path.resolve(serverRoot, required('UPLOAD_DIR', 'uploads')),
  uploadMaxBytes: Number(required('UPLOAD_MAX_MB', '5')) * 1024 * 1024,
  seed: {
    adminName: required('ADMIN_NAME', 'Shreeji Admin'),
    adminEmail: required('ADMIN_EMAIL', 'admin@shreeji.com').toLowerCase(),
    adminPassword: required('ADMIN_PASSWORD', 'Admin@12345'),
  },
} as const;

export type Env = typeof env;