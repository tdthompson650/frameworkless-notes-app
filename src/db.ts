import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
}

export const db = new Pool({
    connectionString: databaseUrl,
});

export async function createNote(title: string, body: string) {
    const result = await db.query(
        `
        INSERT INTO notes (title, body)
        VALUES ($1, $2)
        RETURNING id, title, body, created_at
      `,
        [title, body]
    );

    return result.rows[0];
}

export async function getAllNotes() {
    const result = await db.query(
        `
        SELECT id, title, body, created_at
        FROM notes
        ORDER BY created_at DESC
      `
    );

    return result.rows;
}

export async function getNoteById(id: string) {
    const result = await db.query(
        `
        SELECT id, title, body, created_at
        FROM notes
        WHERE id = $1
      `,
        [id]
    );

    return result.rows[0] ?? null;
}

export async function deleteNoteById(id: string) {
    const result = await db.query(
      `
        DELETE FROM notes
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );
  
    return result.rows[0] ?? null;
  }