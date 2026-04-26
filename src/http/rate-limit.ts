import type { IncomingMessage } from 'node:http';

import { getTrustForwardedFor } from '../config/env.js';

/**
 * In-memory fixed-window rate limiting (per-process).
 * Security: slows abuse of login/signup and reduces credential-stuffing throughput.
 * Ops: not shared across multiple server instances; replace with Redis or edge limits for scale.
 */

type RateLimitBucket = {
	count: number;
	resetAtMs: number;
};

type RateLimitResult = {
	allowed: boolean;
	retryAfterSeconds: number;
};

const buckets = new Map<string, RateLimitBucket>();

function getForwardedForHeaderValue(request: IncomingMessage): string | undefined {
	const header = request.headers['x-forwarded-for'];

	if (typeof header === 'string' && header.trim() !== '') {
		return header;
	}

	if (Array.isArray(header) && header.length > 0 && typeof header[0] === 'string') {
		const first = header[0].trim();
		return first !== '' ? first : undefined;
	}

	return undefined;
}

/**
 * Client IP for rate-limit keys.
 * Security: `TRUST_FORWARDED_FOR` must stay false when the app is exposed without a
 * trusted reverse proxy, or clients can spoof `X-Forwarded-For` and bypass limits.
 */
export function getClientIp(request: IncomingMessage): string {
	if (getTrustForwardedFor()) {
		const forwardedFor = getForwardedForHeaderValue(request);

		if (forwardedFor !== undefined) {
			return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
		}
	}

	return request.socket.remoteAddress ?? 'unknown';
}

export function checkRateLimit(
	key: string,
	maxAttempts: number,
	windowMs: number,
	nowMs: number = Date.now()
): RateLimitResult {
	const existingBucket = buckets.get(key);

	if (!existingBucket || existingBucket.resetAtMs <= nowMs) {
		buckets.set(key, {
			count: 1,
			resetAtMs: nowMs + windowMs,
		});

		return {
			allowed: true,
			retryAfterSeconds: 0,
		};
	}

	if (existingBucket.count >= maxAttempts) {
		return {
			allowed: false,
			retryAfterSeconds: Math.max(
				1,
				Math.ceil((existingBucket.resetAtMs - nowMs) / 1000)
			),
		};
	}

	existingBucket.count += 1;

	return {
		allowed: true,
		retryAfterSeconds: 0,
	};
}