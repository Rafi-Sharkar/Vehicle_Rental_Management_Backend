import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5433,
      user: process.env.DB_USER || 'vrm_user',
      password: process.env.DB_PASSWORD || 'vrm_password',
      database: process.env.DB_NAME || 'vrm_db'
    },
    pool: {
      min: Number(process.env.DB_POOL_MIN) || 2,
      max: Number(process.env.DB_POOL_MAX) || 10
    },
    migrations: {
      directory: path.join(process.cwd(), 'src', 'database', 'migrations'),
      extension: 'ts'
    },
    seeds: {
      directory: path.join(process.cwd(), 'src', 'database', 'seeds'),
      extension: 'ts'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5433,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: {
      min: Number(process.env.DB_POOL_MIN) || 2,
      max: Number(process.env.DB_POOL_MAX) || 10
    },
    migrations: {
      directory: path.join(process.cwd(), 'dist', 'database', 'migrations'),
      extension: 'js'
    },
    seeds: {
      directory: path.join(process.cwd(), 'dist', 'database', 'seeds'),
      extension: 'js'
    }
  }
};

export default knexConfig;
