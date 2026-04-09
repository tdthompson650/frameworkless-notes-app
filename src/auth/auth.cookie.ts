import type { IncomingMessage } from 'node:http';

import { SESSION_COOKIE_NAME } from './auth.constants.js';

const PRE_AUTH_CSRF_COOKIE_NAME = 'pre_auth_csrf';

type CookieMap = Record<string, string>;

export function parseCookieHeader(cookieHeader: string | undefined): CookieMap {
	if (!cookieHeader) {
		return {};
	}

	const cookies: CookieMap = {};

	for (const part of cookieHeader.split(';')) {
		const trimmedPart = part.trim();

		if (!trimmedPart) {
			continue;
		}

		const separatorIndex = trimmedPart.indexOf('=');

		if (separatorIndex === -1) {
			continue;
		}

		const name = trimmedPart.slice(0, separatorIndex).trim();
		const value = trimmedPart.slice(separatorIndex + 1);

		if (!name) {
			continue;
		}

		cookies[name] = decodeURIComponent(value);
	}

	return cookies;
}

export function getSessionTokenFromRequest(
	request: IncomingMessage
): string | null {
	const cookies = parseCookieHeader(request.headers.cookie);
	return cookies[SESSION_COOKIE_NAME] ?? null;
}

export function getPreAuthCsrfTokenFromRequest(
	request: IncomingMessage
): string | null {
	const cookies = parseCookieHeader(request.headers.cookie);
	return cookies[PRE_AUTH_CSRF_COOKIE_NAME] ?? null;
}

export function createSessionCookie(
	token: string,
	expiresAt: Date,
	isSecure: boolean
): string {
	const parts = [
		`${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
		'Path=/',
		'HttpOnly',
		'SameSite=Lax',
		`Expires=${expiresAt.toUTCString()}`,
	];

	if (isSecure) {
		parts.push('Secure');
	}

	return parts.join('; ');
}

export function createClearedSessionCookie(isSecure: boolean): string {
	const parts = [
		`${SESSION_COOKIE_NAME}=`,
		'Path=/',
		'HttpOnly',
		'SameSite=Lax',
		'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
	];

	if (isSecure) {
		parts.push('Secure');
	}

	return parts.join('; ');
}

export function createPreAuthCsrfCookie(
	token: string,
	isSecure: boolean
): string {
	const parts = [
		`${PRE_AUTH_CSRF_COOKIE_NAME}=${encodeURIComponent(token)}`,
		'Path=/',
		'HttpOnly',
		'SameSite=Lax',
		'Max-Age=3600',
	];

	if (isSecure) {
		parts.push('Secure');
	}

	return parts.join('; ');
}

export function createClearedPreAuthCsrfCookie(isSecure: boolean): string {
	const parts = [
		`${PRE_AUTH_CSRF_COOKIE_NAME}=`,
		'Path=/',
		'HttpOnly',
		'SameSite=Lax',
		'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
	];

	if (isSecure) {
		parts.push('Secure');
	}

	return parts.join('; ');
}