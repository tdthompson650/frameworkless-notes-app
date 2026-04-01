import type { ServerResponse } from 'node:http';
import { sendHtml } from '../http/response.js';
import { renderPage } from './layout.js';

export function handleHome(response: ServerResponse): void {
    const content = `
        <h1>Home page</h1>
    `;

    const html = renderPage('Home page', content);
    sendHtml(response, html);
}