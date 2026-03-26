import { db } from './db.js';

async function initDb() {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

        console.log('Notes table is ready.');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    } finally {
        await db.end();
    }
}

initDb();