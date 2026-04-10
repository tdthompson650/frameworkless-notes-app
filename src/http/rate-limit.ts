import type { IncomingMessage } from 'node:http';

type RateLimitBucket = {
	count: number;
	resetAtMs: number;
};

type RateLimitResult = {
	allowed: boolean;
	retryAfterSeconds: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function getClientIp(request: IncomingMessage): string {
	const forwardedFor = request.headers['x-forwarded-for'];

	if (typeof forwardedFor === 'string' && forwardedFor.trim() !== '') {
		return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
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