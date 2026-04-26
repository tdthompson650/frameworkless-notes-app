import type { ServerResponse } from 'node:http';

/**
 * HSTS: tells browsers to use HTTPS for this host. Only set in production when
 * every public URL is HTTPS (misconfiguration can break HTTP-only dev).
 * Security: reduces downgrade and cookie exposure on insecure transport.
 */
const STRICT_TRANSPORT_SECURITY_VALUE = 'max-age=31536000';

/**
 * Baseline headers for any response (HTML, CSS, redirects).
 * Security:
 * - `X-Content-Type-Options: nosniff` — reduces MIME sniffing that can turn uploads into executable content.
 * - `Referrer-Policy: no-referrer` — avoids leaking path/query to third parties.
 * - HSTS in production only (see constant above).
 */
export function applyCommonSecurityHeaders(response: ServerResponse): void {
	response.setHeader('X-Content-Type-Options', 'nosniff');
	response.setHeader('Referrer-Policy', 'no-referrer');

	if (process.env.NODE_ENV === 'production') {
		response.setHeader('Strict-Transport-Security', STRICT_TRANSPORT_SECURITY_VALUE);
	}
}

/**
 * HTML document headers: extends common headers with framing and CSP.
 * Security:
 * - `X-Frame-Options: DENY` + `frame-ancestors 'none'` — clickjacking mitigation.
 * - CSP: default deny; allow styles and images from this origin only; no script;
 *   forms may only post to this site. Adjust if you add CDNs, inline script, or fonts.
 */
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