export const SESSION_COOKIE_NAME = 'session';
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export function getSessionExpiresAt(now: Date = new Date()): Date {
	return new Date(now.getTime() + SESSION_DURATION_MS);
}