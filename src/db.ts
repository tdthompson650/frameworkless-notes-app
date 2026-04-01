import { Pool } from 'pg';
import { getDatabaseUrl } from './config/env.js';

export const db = new Pool({
    connectionString: getDatabaseUrl(),
});