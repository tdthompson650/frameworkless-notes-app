import type { ServerResponse } from 'node:http';

import { sendHtml } from '../http/response.js';
import { escapeHtml } from '../utils/escape.js';
import { renderPage } from '../views/layout.js';
import type { LoginFieldErrors, SignupFieldErrors } from './auth.validation.js';
import { emptyLoginFieldErrors, emptySignupFieldErrors } from './auth.validation.js';

type SignupViewOptions = {
	fieldErrors?: SignupFieldErrors;
	email?: string;
	csrfToken?: string;
};

type LoginViewOptions = {
	fieldErrors?: LoginFieldErrors;
	/** Generic credential failure; both fields are marked invalid for assistive tech. */
	authErrorMessage?: string;
	email?: string;
	csrfToken?: string;
};

function renderFieldErrorBlock(elementId: string, messages: string[]): string {
	if (messages.length === 0) {
		return '';
	}

	const items = messages.map((msg) => `<li>${escapeHtml(msg)}</li>`).join('');

	return `
            <div id="${elementId}" class="field-error">
                <ul>${items}</ul>
            </div>`;
}

function renderFormErrorSummary(summaryId: string, headingId: string, messages: string[]): string {
	if (messages.length === 0) {
		return '';
	}

	const items = messages.map((msg) => `<li>${escapeHtml(msg)}</li>`).join('');

	return `
        <div
            id="${summaryId}"
            class="form-error-summary"
            tabindex="-1"
            aria-labelledby="${headingId}"
            aria-live="polite"
        >
            <h2 id="${headingId}">Please fix the following errors:</h2>
            <ul>${items}</ul>
        </div>`;
}

function flattenSignupMessages(fieldErrors: SignupFieldErrors): string[] {
	return [...fieldErrors.email, ...fieldErrors.password, ...fieldErrors.confirmPassword];
}

function flattenLoginMessages(fieldErrors: LoginFieldErrors): string[] {
	return [...fieldErrors.email, ...fieldErrors.password];
}

function signupAutofocusFlags(fieldErrors: SignupFieldErrors): {
	email: string;
	password: string;
	confirmPassword: string;
} {
	const focus = ' autofocus';

	if (fieldErrors.email.length > 0) {
		return { email: focus, password: '', confirmPassword: '' };
	}

	if (fieldErrors.password.length > 0) {
		return { email: '', password: focus, confirmPassword: '' };
	}

	if (fieldErrors.confirmPassword.length > 0) {
		return { email: '', password: '', confirmPassword: focus };
	}

	return { email: '', password: '', confirmPassword: '' };
}

function loginAutofocusFlags(
	fieldErrors: LoginFieldErrors,
	hasAuthError: boolean
): { email: string; password: string } {
	const focus = ' autofocus';

	if (fieldErrors.email.length > 0) {
		return { email: focus, password: '' };
	}

	if (fieldErrors.password.length > 0) {
		return { email: '', password: focus };
	}

	if (hasAuthError) {
		return { email: focus, password: '' };
	}

	return { email: '', password: '' };
}

function describedByAttr(...ids: string[]): string {
	const unique = [...new Set(ids.filter((id) => id !== ''))];

	if (unique.length === 0) {
		return '';
	}

	return ` aria-describedby="${unique.join(' ')}"`;
}

export function handleSignupNew(
	response: ServerResponse,
	options?: SignupViewOptions,
	status: number = 200
): void {
	const fieldErrors = options?.fieldErrors ?? emptySignupFieldErrors();
	const email = options?.email ?? '';
	const csrfToken = options?.csrfToken ?? '';

	const summaryMessages = flattenSignupMessages(fieldErrors);
	const summaryHtml = renderFormErrorSummary(
		'signup-error-summary',
		'signup-error-summary-heading',
		summaryMessages
	);

	const emailDescribedBy = fieldErrors.email.length > 0 ? 'signup-email-error' : '';
	const passwordDescribedBy = fieldErrors.password.length > 0 ? 'signup-password-error' : '';
	const confirmDescribedBy =
		fieldErrors.confirmPassword.length > 0 ? 'signup-confirm-password-error' : '';

	const focus = signupAutofocusFlags(fieldErrors);

	const content = `
        <h1>Sign up</h1>

        ${summaryHtml}

        <form method="post" action="/signup">
            <input
                type="hidden"
                name="csrfToken"
                value="${escapeHtml(csrfToken)}"
            >

            <div>
                <label for="email">Email</label>
                ${renderFieldErrorBlock('signup-email-error', fieldErrors.email)}
                <input
                    id="email"
                    name="email"
                    type="email"
                    value="${escapeHtml(email)}"
                    autocomplete="email"
                    ${fieldErrors.email.length > 0 ? 'aria-invalid="true"' : ''}${describedByAttr(emailDescribedBy)}
                    ${focus.email}
                >
            </div>

            <div>
                <label for="password">Password</label>
                ${renderFieldErrorBlock('signup-password-error', fieldErrors.password)}
                <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="new-password"
                    ${fieldErrors.password.length > 0 ? 'aria-invalid="true"' : ''}${describedByAttr(passwordDescribedBy)}
                    ${focus.password}
                >
            </div>

            <div>
                <label for="confirmPassword">Confirm password</label>
                ${renderFieldErrorBlock('signup-confirm-password-error', fieldErrors.confirmPassword)}
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autocomplete="new-password"
                    ${fieldErrors.confirmPassword.length > 0 ? 'aria-invalid="true"' : ''}${describedByAttr(confirmDescribedBy)}
                    ${focus.confirmPassword}
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
	const fieldErrors = options?.fieldErrors ?? emptyLoginFieldErrors();
	const authErrorMessage = options?.authErrorMessage?.trim() ?? '';
	const hasAuthError = authErrorMessage !== '';
	const email = options?.email ?? '';
	const csrfToken = options?.csrfToken ?? '';

	const fieldMessages = flattenLoginMessages(fieldErrors);
	const summaryHtml =
		fieldMessages.length > 0
			? renderFormErrorSummary(
					'login-error-summary',
					'login-error-summary-heading',
					fieldMessages
				)
			: '';

	const authErrorBlock = hasAuthError
		? `
            <div id="login-auth-error" class="field-error" role="alert">
                <p>${escapeHtml(authErrorMessage)}</p>
            </div>`
		: '';

	const emailHasError = fieldErrors.email.length > 0 || hasAuthError;
	const passwordHasError = fieldErrors.password.length > 0 || hasAuthError;

	const emailDescribedIds: string[] = [];
	if (fieldErrors.email.length > 0) {
		emailDescribedIds.push('login-email-error');
	}
	if (hasAuthError) {
		emailDescribedIds.push('login-auth-error');
	}

	const passwordDescribedIds: string[] = [];
	if (fieldErrors.password.length > 0) {
		passwordDescribedIds.push('login-password-error');
	}
	if (hasAuthError) {
		passwordDescribedIds.push('login-auth-error');
	}

	const focus = loginAutofocusFlags(fieldErrors, hasAuthError);

	const content = `
        <h1>Log in</h1>

        ${summaryHtml}

        <form method="post" action="/login">
            <input
                type="hidden"
                name="csrfToken"
                value="${escapeHtml(csrfToken)}"
            >
            ${authErrorBlock}

            <div>
                <label for="email">Email</label>
                ${renderFieldErrorBlock('login-email-error', fieldErrors.email)}
                <input
                    id="email"
                    name="email"
                    type="email"
                    value="${escapeHtml(email)}"
                    autocomplete="email"
                    ${emailHasError ? 'aria-invalid="true"' : ''}${describedByAttr(...emailDescribedIds)}
                    ${focus.email}
                >
            </div>

            <div>
                <label for="password">Password</label>
                ${renderFieldErrorBlock('login-password-error', fieldErrors.password)}
                <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    ${passwordHasError ? 'aria-invalid="true"' : ''}${describedByAttr(...passwordDescribedIds)}
                    ${focus.password}
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
