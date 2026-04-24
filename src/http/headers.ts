import type { ServerResponse } from 'node:http';

/** Tells browsers to use HTTPS for this host for a long time. Only set in production when every public URL is HTTPS (e.g. Render). */
const STRICT_TRANSPORT_SECURITY_VALUE = 'max-age=31536000';

export function applyCommonSecurityHeaders(response: ServerResponse): void {
	response.setHeader('X-Content-Type-Options', 'nosniff');
	response.setHeader('Referrer-Policy', 'no-referrer');

	if (process.env.NODE_ENV === 'production') {
		response.setHeader('Strict-Transport-Security', STRICT_TRANSPORT_SECURITY_VALUE);
	}
}

export function applyDocumentSecurityHeaders(response: ServerResponse): void {
	applyCommonSecurityHeaders(response);

	response.setHeader('X-Frame-Options', 'DENY');
	response.setHeader(
		'Content-Security-Policy',
		[
			"default-src 'none'",
			"style-src 'self'",
			"img-src 'self' data:",
			"form-action 'self'",
			"base-uri 'none'",
			"frame-ancestors 'none'",
			"script-src 'none'",
		].join('; ')
	);
}