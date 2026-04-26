import { Pool } from 'pg';
import { getDatabaseUrl } from './config/env.js';

/** Shared PostgreSQL pool for the app process. */
export const db = new Pool({
	connectionString: getDatabaseUrl(),
});