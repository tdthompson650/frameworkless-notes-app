export type UserId = string;
export type SessionId = string;

/** Row from the `users` table: keys match PostgreSQL columns (snake_case). Map to `User` for app code. */
export type UserRow = {
	id: UserId;
	email: string;
	password_hash: string;
	created_at: Date;
};

/** In-memory / app-layer user: camelCase fields. Built from a `UserRow` via `mapUserRow`. */
export type User = {
	id: UserId;
	email: string;
	passwordHash: string;
	createdAt: Date;
};

/** Row from the `sessions` table: keys match PostgreSQL columns (snake_case). Map to `Session` for app code. */
export type SessionRow = {
	id: SessionId;
	user_id: UserId;
	token_hash: string;
	csrf_token: string;
	expires_at: Date;
	created_at: Date;
};

/** In-memory / app-layer session: camelCase fields. Built from a `SessionRow` via `mapSessionRow`. */
export type Session = {
	id: SessionId;
	userId: UserId;
	tokenHash: string;
	csrfToken: string;
	expiresAt: Date;
	createdAt: Date;
};

export function mapUserRow(row: UserRow): User {
	return {
		id: row.id,
		email: row.email,
		passwordHash: row.password_hash,
		createdAt: row.created_at,
	};
}

export function mapSessionRow(row: SessionRow): Session {
	return {
		id: row.id,
		userId: row.user_id,
		tokenHash: row.token_hash,
		csrfToken: row.csrf_token,
		expiresAt: row.expires_at,
		createdAt: row.created_at,
	};
}