import type { ServerResponse } from 'node:http';

export function applyCommonSecurityHeaders(response: ServerResponse): void {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
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