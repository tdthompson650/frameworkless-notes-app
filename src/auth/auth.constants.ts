export const SESSION_COOKIE_NAME = 'session';

/** Browser session lifetime (must align with server-side `expires_at` when creating sessions). */
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export function getSessionExpiresAt(now: Date = new Date()): Date {
	return new Date(now.getTime() + SESSION_DURATION_MS);
}