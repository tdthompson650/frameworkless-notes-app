import { db } from '../db.js';
import type {
	Session,
	SessionId,
	SessionRow,
	User,
	UserId,
	UserRow,
} from './auth.types.js';
import { mapSessionRow, mapUserRow } from './auth.types.js';

export async function createUser(
	email: string,
	passwordHash: string
): Promise<User> {
	const result = await db.query<UserRow>(
		`
            INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING id, email, password_hash, created_at
        `,
		[email, passwordHash]
	);

	const row = result.rows[0];

	if (!row) {
		throw new Error('Failed to create user');
	}

	return mapUserRow(row);
}

export async function getUserByEmail(email: string): Promise<User | null> {
	const result = await db.query<UserRow>(
		`
            SELECT id, email, password_hash, created_at
            FROM users
            WHERE email = $1
        `,
		[email]
	);

	const row = result.rows[0];
	return row ? mapUserRow(row) : null;
}

export async function getUserById(id: UserId): Promise<User | null> {
	const result = await db.query<UserRow>(
		`
            SELECT id, email, password_hash, created_at
            FROM users
            WHERE id = $1
        `,
		[id]
	);

	const row = result.rows[0];
	return row ? mapUserRow(row) : null;
}

export async function createSession(
	userId: UserId,
	tokenHash: string,
	csrfToken: string,
	expiresAt: Date
): Promise<Session> {
	const result = await db.query<SessionRow>(
		`
            INSERT INTO sessions (user_id, token_hash, csrf_token, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, token_hash, csrf_token, expires_at, created_at
        `,
		[userId, tokenHash, csrfToken, expiresAt]
	);

	const row = result.rows[0];

	if (!row) {
		throw new Error('Failed to create session');
	}

	return mapSessionRow(row);
}

export async function getSessionByTokenHash(
	tokenHash: string
): Promise<Session | null> {
	const result = await db.query<SessionRow>(
		`
            SELECT id, user_id, token_hash, csrf_token, expires_at, created_at
            FROM sessions
            WHERE token_hash = $1
        `,
		[tokenHash]
	);

	const row = result.rows[0];
	return row ? mapSessionRow(row) : null;
}

export async function deleteSessionByTokenHash(
	tokenHash: string
): Promise<{ id: SessionId } | null> {
	const result = await db.query<{ id: SessionId }>(
		`
            DELETE FROM sessions
            WHERE token_hash = $1
            RETURNING id
        `,
		[tokenHash]
	);

	return result.rows[0] ?? null;
}

/**
 * Removes all expired sessions. Not called on the request path today; intended for a
 * periodic job so the `sessions` table does not grow forever in long-running deploys.
 */
export async function deleteExpiredSessions(): Promise<number> {
	const result = await db.query(
		`
            DELETE FROM sessions
            WHERE expires_at <= NOW()
        `
	);

	return result.rowCount ?? 0;
}