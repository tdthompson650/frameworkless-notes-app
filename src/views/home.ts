import type { ServerResponse } from 'node:http';

import { sendHtml } from '../http/response.js';
import { buildRenderPageOptions, renderPage } from './layout.js';

export function handleHome(
	response: ServerResponse,
	currentUserEmail?: string | null,
	logoutCsrfToken?: string | null
): void {
	const content = `
    <h1>Home page</h1>
  `;

	const html = renderPage(
		'Home page',
		content,
		buildRenderPageOptions(currentUserEmail, logoutCsrfToken)
	);
	sendHtml(response, html);
}