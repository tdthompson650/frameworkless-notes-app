/**
 * Server logging. Do not pass passwords, session tokens, raw cookies, full connection strings,
 * or raw request bodies—especially on `/login`, `/signup`, or `/logout`.
 */

export function logInfo(message: string, data?: unknown): void {
	if (data === undefined) {
		console.log(`[INFO] ${message}`);
		return;
	}

	console.log(`[INFO] ${message}`, data);
}

export function logWarn(message: string, data?: unknown): void {
	if (data === undefined) {
		console.warn(`[WARN] ${message}`);
		return;
	}

	console.warn(`[WARN] ${message}`, data);
}

export function logError(message: string, data?: unknown): void {
	if (data === undefined) {
		console.error(`[ERROR] ${message}`);
		return;
	}

	console.error(`[ERROR] ${message}`, data);
}

/** Prefer for errors that might carry verbose driver details (e.g. DB startup). Omits stack traces. */
export function logErrorSummary(message: string, error: unknown): void {
	if (error instanceof Error) {
		console.error(`[ERROR] ${message}`, {
			name: error.name,
			message: error.message,
		});
		return;
	}

	console.error(`[ERROR] ${message}`, error);
}
