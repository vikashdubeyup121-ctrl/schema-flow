import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  jwtExpiration: process.env.JWT_EXPIRATION_MS ? parseInt(process.env.JWT_EXPIRATION_MS, 10) : 7 * 24 * 60 * 60 * 1000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
