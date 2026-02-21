import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/inventory_app';
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

if (!MONGODB_URI) {
  // In real projects you might throw here; we keep a sensible default for local dev.
  // eslint-disable-next-line no-console
  console.warn('MONGODB_URI is not set. Falling back to default local URI.');
}

export const env = {
  port: PORT,
  mongoUri: MONGODB_URI,
  jwtSecret: JWT_SECRET
};

