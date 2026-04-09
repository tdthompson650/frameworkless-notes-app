import { randomBytes, createHash } from 'node:crypto';

const SESSION_TOKEN_BYTES = 32;

export function generateSessionToken(): string {
	return randomBytes(SESSION_TOKEN_BYTES).toString('hex');
}

export function hashSessionToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}