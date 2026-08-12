"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const config = {
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
            directory: path_1.default.join(process.cwd(), 'src', 'database', 'migrations'),
            extension: 'ts'
        },
        seeds: {
            directory: path_1.default.join(process.cwd(), 'src', 'database', 'seeds'),
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
            directory: path_1.default.join(process.cwd(), 'dist', 'database', 'migrations'),
            extension: 'js'
        },
        seeds: {
            directory: path_1.default.join(process.cwd(), 'dist', 'database', 'seeds'),
            extension: 'js'
        }
    }
};
exports.default = config;
