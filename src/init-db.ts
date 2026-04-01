import { db } from './db.js';

async function initDb() {
    try {
        await db.query(`
            DROP TABLE IF EXISTS notes;

            CREATE TABLE notes (
                id BIGSERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT notes_title_not_blank
                    CHECK (btrim(title) <> ''),

                CONSTRAINT notes_body_not_blank
                    CHECK (btrim(body) <> ''),

                CONSTRAINT notes_title_max_length
                    CHECK (char_length(title) <= 200),

                CONSTRAINT notes_body_max_length
                    CHECK (char_length(body) <= 10000)
            );
        `);

        console.log('Notes table recreated with constraints.');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

void initDb();