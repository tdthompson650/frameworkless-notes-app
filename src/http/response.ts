import type { ServerResponse } from 'node:http';
import { applyCommonSecurityHeaders, applyDocumentSecurityHeaders } from './headers.js';
import { AppError, MethodNotAllowedError } from './errors.js';
import { renderErrorDocument } from '../views/error-page.js';

/**
 * HTML/CSS/redirect helpers. HTML uses full document CSP (stricter than CSS-only responses).
 */

function shortStatusTitle(statusCode: number): string {
	switch (statusCode) {
		case 400:
			return 'Bad Request';
		case 403:
			return 'Forbidden';
		case 404:
			return 'Not Found';
		case 405:
			return 'Method Not Allowed';
		case 413:
			return 'Request Entity Too Large';
		case 415:
			return 'Unsupported Media Type';
		case 429:
			return 'Too Many Requests';
		case 500:
			return 'Internal Server Error';
		default:
			return 'Error';
	}
}

export function sendErrorResponse(response: ServerResponse, error: unknown): void {
	if (error instanceof MethodNotAllowedError) {
		response.setHeader('Allow', error.allowedMethods.join(', '));
		const message = error.exposeMessage ? error.message : 'Internal Server Error';
		const html = renderErrorDocument({
			title: `${405} ${shortStatusTitle(405)}`,
			heading: shortStatusTitle(405),
			message,
		});
		sendHtml(response, html, error.statusCode);
		return;
	}

	if (error instanceof AppError) {
		const message = error.exposeMessage ? error.message : 'Internal Server Error';
		const statusCode = error.statusCode;
		const heading = shortStatusTitle(statusCode);
		const html = renderErrorDocument({
			title: `${statusCode} ${heading}`,
			heading,
			message,
		});
		sendHtml(response, html, statusCode);
		return;
	}

	sendServerError(response);
}

/**
 * Sends an HTML document. HEAD requests get headers but no body (HTTP semantics).
 */
export function sendHtml(
	response: ServerResponse,
	html: string,
	status: number = 200
): void {
	const isHeadRequest = response.req?.method === 'HEAD';

	response.statusCode = status;
	response.setHeader('Content-Type', 'text/html; charset=utf-8');
	applyDocumentSecurityHeaders(response);
	response.end(isHeadRequest ? undefined : html);
}

export function sendCss(
	response: ServerResponse,
	css: string,
	status: number = 200
): void {
	const isHeadRequest = response.req?.method === 'HEAD';

	response.statusCode = status;
	response.setHeader('Content-Type', 'text/css; charset=utf-8');
	applyCommonSecurityHeaders(response);
	response.end(isHeadRequest ? undefined : css);
}

/**
 * Post/Redirect/Get: 303 clears the POST from history and avoids accidental resubmission.
 */
export function sendRedirect(
	response: ServerResponse,
	location: string,
	status: number = 303
): void {
	response.statusCode = status;
	response.setHeader('Location', location);
	applyCommonSecurityHeaders(response);
	response.end();
}

function sendServerError(response: ServerResponse): void {
	const statusCode = 500;
	const heading = shortStatusTitle(statusCode);
	const html = renderErrorDocument({
		title: `${statusCode} ${heading}`,
		heading,
		message: 'Internal Server Error',
	});
	sendHtml(response, html, statusCode);
}
