import { db } from '../db.js';
import type { UserId } from '../auth/auth.types.js';
import type { CreateNoteInput, Note, NoteId, NoteRow } from './note.types.js';

function mapNoteRow(row: NoteRow): Note {
	return {
		id: row.id,
		title: row.title,
		body: row.body,
		createdAt: row.created_at,
	};
}

export async function getNotesByUserId(userId: UserId): Promise<Note[]> {
	const result = await db.query<NoteRow>(
		`
			SELECT id, title, body, created_at
			FROM notes
			WHERE user_id = $1
			ORDER BY created_at DESC, id DESC
		`,
		[userId]
	);

	return result.rows.map(mapNoteRow);
}

export async function getNoteByIdForUser(
	noteId: NoteId,
	userId: UserId
): Promise<Note | null> {
	const result = await db.query<NoteRow>(
		`
			SELECT id, title, body, created_at
			FROM notes
			WHERE id = $1 AND user_id = $2
		`,
		[noteId, userId]
	);

	const row = result.rows[0];
	return row ? mapNoteRow(row) : null;
}

export async function createNote(
	userId: UserId,
	input: CreateNoteInput
): Promise<Note> {
	const result = await db.query<NoteRow>(
		`
			INSERT INTO notes (user_id, title, body)
			VALUES ($1, $2, $3)
			RETURNING id, title, body, created_at
		`,
		[userId, input.title, input.body]
	);

	const row = result.rows[0];

	if (!row) {
		throw new Error('Failed to create note');
	}

	return mapNoteRow(row);
}

export async function deleteNoteByIdForUser(
	noteId: NoteId,
	userId: UserId
): Promise<Note | null> {
	const result = await db.query<NoteRow>(
		`
			DELETE FROM notes
			WHERE id = $1 AND user_id = $2
			RETURNING id, title, body, created_at
		`,
		[noteId, userId]
	);

	const row = result.rows[0];
	return row ? mapNoteRow(row) : null;
}