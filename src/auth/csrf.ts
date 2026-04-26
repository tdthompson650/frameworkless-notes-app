import { randomBytes, timingSafeEqual } from 'node:crypto';

/** Used in forms and compared on the server (double-submit / synchronizer pattern). */
export function generateCsrfToken(): string {
	return randomBytes(32).toString('hex');
}

/**
 * Compares submitted token to the expected value using a constant-time compare.
 * Security: timingSafeEqual mitigates timing side channels on token equality.
 */
export function isValidCsrfToken(
	submittedToken: string | undefined,
	expectedToken: string
): boolean {
	if (!submittedToken) {
		return false;
	}

	const submittedBuffer = Buffer.from(submittedToken, 'utf8');
	const expectedBuffer = Buffer.from(expectedToken, 'utf8');

	if (submittedBuffer.length !== expectedBuffer.length) {
		return false;
	}

	return timingSafeEqual(submittedBuffer, expectedBuffer);
}