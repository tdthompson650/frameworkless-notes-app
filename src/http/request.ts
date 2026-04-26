import type { IncomingMessage } from 'node:http';
import { MAX_REQUEST_BODY_SIZE } from '../config/constants.js';
import { RequestEntityTooLargeError } from './errors.js';

/**
 * Reads the raw request body with a hard size cap.
 * Security: limits memory use and mitigates denial-of-service from huge bodies (DoS).
 */
export async function readFormBody(request: IncomingMessage): Promise<string> {
	const chunks: Buffer[] = [];
	let totalSize = 0;

	for await (const chunk of request) {
		const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

		totalSize += bufferChunk.length;

		if (totalSize > MAX_REQUEST_BODY_SIZE) {
			request.destroy();
			throw new RequestEntityTooLargeError();
		}

		chunks.push(bufferChunk);
	}

	return Buffer.concat(chunks).toString('utf8');
}

/** Parses `application/x-www-form-urlencoded` bodies into flat string fields. */
export function parseFormData(rawBody: string): Record<string, string> {
	const params = new URLSearchParams(rawBody);
	const fields: Record<string, string> = {};

	for (const [key, value] of params.entries()) {
		fields[key] = value;
	}

	return fields;
}

/**
 * Security: reject non-form bodies so we do not parse unexpected content types as form data.
 */
export function isFormUrlEncoded(request: IncomingMessage): boolean {
	const contentTypeHeader = request.headers['content-type'];

	if (typeof contentTypeHeader !== 'string') return false;

	return contentTypeHeader.startsWith('application/x-www-form-urlencoded');
}
