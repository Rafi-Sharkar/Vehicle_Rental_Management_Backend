import knex from 'knex';
import { knexConfig } from './knexConfig';
import { ENV } from './env';

const environment = ENV.NODE_ENV === 'production' ? 'production' : 'development';
const db = knex(knexConfig[environment]);

export default db;
