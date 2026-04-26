import { randomBytes, createHash } from 'node:crypto';

const SESSION_TOKEN_BYTES = 32;

/** Opaque cookie value; high entropy. */
export function generateSessionToken(): string {
	return randomBytes(SESSION_TOKEN_BYTES).toString('hex');
}

/**
 * Security: only SHA-256 hashes of session tokens are stored server-side so a DB leak
 * does not immediately yield valid session cookies.
 */
export function hashSessionToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}