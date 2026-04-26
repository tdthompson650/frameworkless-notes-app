/** Base type for HTTP errors mapped to responses; `exposeMessage` controls user-visible text. */
export class AppError extends Error {
	readonly statusCode: number;
	readonly exposeMessage: boolean;

	constructor(message: string, statusCode: number, exposeMessage: boolean = true) {
		super(message);
		this.name = 'AppError';
		this.statusCode = statusCode;
		this.exposeMessage = exposeMessage;
	}
}

export class RequestEntityTooLargeError extends AppError {
	constructor(message: string = 'Request Entity Too Large') {
		super(message, 413, true);
		this.name = 'RequestEntityTooLargeError';
	}
}

export class UnsupportedMediaTypeError extends AppError {
	constructor(message: string = 'Unsupported Media Type') {
		super(message, 415, true);
		this.name = 'UnsupportedMediaTypeError';
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = 'Not found') {
		super(message, 404, true);
		this.name = 'NotFoundError';
	}
}

export class MethodNotAllowedError extends AppError {
	readonly allowedMethods: string[];

	constructor(allowedMethods: string[], message: string = 'Method Not Allowed') {
		super(message, 405, true);
		this.name = 'MethodNotAllowedError';
		this.allowedMethods = allowedMethods;
	}
}

/**
 * Security: form token missing or did not match server state (CSRF failure).
 */
export class InvalidCsrfTokenError extends AppError {
	constructor(message = 'Invalid CSRF token') {
		super(message, 403);
		this.name = 'InvalidCsrfTokenError';
	}
}

/** Security: rate limit exceeded; client may read `Retry-After` from the response. */
export class TooManyRequestsError extends AppError {
	constructor(message: string = 'Too Many Requests') {
		super(message, 429, true);
		this.name = 'TooManyRequestsError';
	}
}