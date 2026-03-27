import { Pool } from 'pg';
import dotenv from 'dotenv';
import type { Note, NoteId, NoteRow } from './notes/note.types.js';
import { mapNoteRow } from './notes/note.types.js';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

export const db = new Pool({
  connectionString: databaseUrl,
});

export async function createNote(title: string, body: string): Promise<Note> {
  const result = await db.query<NoteRow>(
    `
      INSERT INTO notes (title, body)
      VALUES ($1, $2)
      RETURNING id, title, body, created_at
    `,
    [title, body]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error('Failed to create note');
  }

  return mapNoteRow(row);
}

export async function getAllNotes(): Promise<Note[]> {
  const result = await db.query<NoteRow>(
    `
      SELECT id, title, body, created_at
      FROM notes
      ORDER BY created_at DESC
    `
  );

  return result.rows.map(mapNoteRow);
}

export async function getNoteById(id: NoteId): Promise<Note | null> {
  const result = await db.query<NoteRow>(
    `
      SELECT id, title, body, created_at
      FROM notes
      WHERE id = $1
    `,
    [id]
  );

  const row = result.rows[0];
  return row ? mapNoteRow(row) : null;
}

export async function deleteNoteById(
  id: NoteId
): Promise<{ id: NoteId } | null> {
  const result = await db.query<{ id: NoteId }>(
    `
      DELETE FROM notes
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows[0] ?? null;
}