import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: Number(process.env.DB_PORT) || 5433,
    USER: process.env.DB_USER || 'vrm_user',
    PASSWORD: process.env.DB_PASSWORD || 'vrm_password',
    NAME: process.env.DB_NAME || 'vrm_db',
    POOL_MIN: Number(process.env.DB_POOL_MIN) || 2,
    POOL_MAX: Number(process.env.DB_POOL_MAX) || 10
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'vrm-development-secret-jwt-key-2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
  },
  UPLOAD_PATH: path.resolve(process.env.UPLOAD_PATH || './uploads'),
  SUPER_ADMIN: {
    EMAIL: process.env.SUPER_ADMIN_EMAIL || 'superadmin@vrm.com',
    PASSWORD: process.env.SUPER_ADMIN_PASSWORD || '12345678'
  }
};
