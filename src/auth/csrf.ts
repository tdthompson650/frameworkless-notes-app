import { randomBytes, timingSafeEqual } from 'node:crypto';

export function generateCsrfToken(): string {
	return randomBytes(32).toString('hex');
}

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