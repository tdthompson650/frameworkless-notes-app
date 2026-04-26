/**
 * Public landing copy and GitHub link. Static strings only (no user data to escape here).
 */

import type { ServerResponse } from 'node:http';

import { GITHUB_REPOSITORY_URL } from '../config/constants.js';
import { sendHtml } from '../http/response.js';
import { escapeHtml } from '../utils/escape.js';
import { buildRenderPageOptions, renderPage } from './layout.js';

export function handleHome(
	response: ServerResponse,
	currentUserEmail?: string | null,
	logoutCsrfToken?: string | null
): void {
	const content = `
    <section>
      <h1>Frameworkless Notes App</h1>
      <p>
        A server-rendered notes application built without a web framework using
        Node’s <code>http</code> module, TypeScript, and PostgreSQL.
      </p>
      <p>
        <a
          href="${escapeHtml(GITHUB_REPOSITORY_URL)}"
          target="_blank"
          rel="noopener noreferrer"
        >Source on GitHub</a>
      </p>
    </section>

    <section>
      <h2>Purpose</h2>
      <p>
        This project was built as a fundamentals-first portfolio piece focused on
        understanding how modern web applications work underneath framework
        abstractions.
      </p>
      <p>
        It emphasizes clear architecture, raw HTTP handling, server rendering,
        authentication, authorization, and practical web security.
      </p>
    </section>

    <section>
      <h2>What it highlights</h2>
      <ul>
        <li>Frameworkless backend and server-rendered HTML</li>
        <li>Security-focused auth, sessions, CSRF protection, and rate limiting</li>
        <li>Per-user authorization for notes</li>
        <li>Responsive layout and accessibility-minded UI decisions</li>
        <li>Production-minded hardening and deployment preparation</li>
      </ul>
    </section>

    <section>
      <h2>Tech stack</h2>
      <ul>
        <li>Node.js</li>
        <li>TypeScript</li>
        <li>PostgreSQL</li>
        <li><code>pg</code></li>
        <li><code>argon2</code></li>
        <li><code>dotenv</code></li>
        <li>Built-in Node <code>http</code> server</li>
      </ul>
    </section>
  `;

	const html = renderPage(
		'Frameworkless Notes App',
		content,
		buildRenderPageOptions(currentUserEmail, logoutCsrfToken)
	);

	sendHtml(response, html);
}