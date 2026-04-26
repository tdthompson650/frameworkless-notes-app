/**
 * Escapes text for HTML text nodes and attribute values.
 * Security: required for any user-controlled or DB-backed string embedded in HTML
 * to prevent cross-site scripting (XSS).
 */
export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
