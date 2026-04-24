import { DatabaseError } from 'pg';

/** PostgreSQL `unique_violation` — e.g. concurrent signups for the same email. */
export function isUniqueViolationError(error: unknown): boolean {
	return error instanceof DatabaseError && error.code === '23505';
}
