import type { ServerResponse } from 'node:http';

import { sendHtml } from '../http/response.js';
import { escapeHtml } from '../utils/escape.js';
import { renderPage } from '../views/layout.js';

type SignupViewOptions = {
	errors?: string[];
	email?: string;
	csrfToken?: string;
};

type LoginViewOptions = {
	errors?: string[];
	email?: string;
	csrfToken?: string;
};

function renderErrorList(errors: string[]): string {
	if (errors.length === 0) {
		return '';
	}

	return `
        <div>
            <h2>Please fix the following errors:</h2>
            <ul>
                ${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}
            </ul>
        </div>
    `;
}

export function handleSignupNew(
	response: ServerResponse,
	options?: SignupViewOptions,
	status: number = 200
): void {
	const errors = options?.errors ?? [];
	const email = options?.email ?? '';
	const csrfToken = options?.csrfToken ?? '';

	const content = `
        <h1>Sign up</h1>

        ${renderErrorList(errors)}

        <form method="post" action="/signup">
            <input
                type="hidden"
                name="csrfToken"
                value="${escapeHtml(csrfToken)}"
            >

            <div>
                <label for="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value="${escapeHtml(email)}"
                    autocomplete="email"
                >
            </div>

            <div>
                <label for="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="new-password"
                >
            </div>

            <div>
                <label for="confirmPassword">Confirm password</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autocomplete="new-password"
                >
            </div>

            <div>
                <button type="submit">Create account</button>
            </div>
        </form>
    `;

	const html = renderPage('Sign up', content);
	sendHtml(response, html, status);
}

export function handleLoginNew(
	response: ServerResponse,
	options?: LoginViewOptions,
	status: number = 200
): void {
	const errors = options?.errors ?? [];
	const email = options?.email ?? '';
	const csrfToken = options?.csrfToken ?? '';

	const content = `
        <h1>Log in</h1>

        ${renderErrorList(errors)}

        <form method="post" action="/login">
            <input
                type="hidden"
                name="csrfToken"
                value="${escapeHtml(csrfToken)}"
            >

            <div>
                <label for="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value="${escapeHtml(email)}"
                    autocomplete="email"
                >
            </div>

            <div>
                <label for="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                >
            </div>

            <div>
                <button type="submit">Log in</button>
            </div>
        </form>
    `;

	const html = renderPage('Log in', content);
	sendHtml(response, html, status);
}