import type { ServerResponse } from 'node:http';
import { sendCss } from '../http/response.js';

const APP_CSS = `
	* {
		box-sizing: border-box;
	}

	html {
		color-scheme: light;
	}

	body {
		margin: 0;
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			Arial,
			sans-serif;
		line-height: 1.5;
		background: #ffffff;
		color: #111111;
	}

	.skip-link {
		position: absolute;
		left: 1rem;
		top: -3rem;
		z-index: 1000;
		padding: 0.75rem 1rem;
		background: #111111;
		color: #ffffff;
		text-decoration: none;
		border-radius: 0.25rem;
	}

	.skip-link:focus,
	.skip-link:focus-visible {
		top: 1rem;
	}

	header {
		padding: 1rem;
		border-bottom: 1px solid #e2e8f0;
		background: #f8fafc;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		align-items: center;
		max-width: 48rem;
		margin-inline: auto;
	}

	.nav-primary {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		align-items: center;
	}

	.nav-user-cluster {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		align-items: center;
		margin-left: auto;
		justify-content: flex-end;
		text-align: right;
	}

	nav a,
	nav button,
	nav .nav-user {
		min-height: 2.75rem;
		display: inline-flex;
		align-items: center;
	}

	nav a {
		color: #0f172a;
		text-decoration: underline;
		text-underline-offset: 0.16em;
		padding: 0.5rem 0;
	}

	a {
		color: #0f172a;
	}

	.inline-form {
		display: inline;
		margin: 0;
	}

	.inline-form input[type='hidden'] {
		display: none;
	}

	.nav-user {
		font-size: 0.9rem;
		color: #475569;
		word-break: break-word;
		max-width: 16rem;
	}

	@media (min-width: 40.01rem) {
		.nav-user {
			text-align: right;
		}
	}

	main {
		max-width: 48rem;
		margin: 0 auto;
		padding: 1rem;
		padding-bottom: 2rem;
	}

	h1,
	h2 {
		line-height: 1.25;
		margin-top: 0;
		color: #0f172a;
	}

	h1 {
		font-size: 1.65rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	form {
		display: grid;
		gap: 1rem;
	}

	form div {
		display: grid;
		gap: 0.35rem;
	}

	.form-error-summary {
		margin-bottom: 1rem;
		padding: 1rem;
		border: 1px solid #991b1b;
		border-radius: 0.375rem;
		background: #fef2f2;
	}

	.form-error-summary h2 {
		font-size: 1.1rem;
		line-height: 1.3;
		margin: 0 0 0.5rem;
		color: #111111;
	}

	.form-error-summary ul {
		margin: 0;
		padding-left: 1.25rem;
		color: #111111;
	}

	.field-error {
		color: #991b1b;
		font-size: 0.95rem;
		font-weight: 500;
	}

	.field-error p {
		margin: 0;
	}

	.field-error ul {
		margin: 0;
		padding-left: 1.25rem;
		list-style: disc;
	}

	label {
		font-weight: 600;
	}

	input,
	textarea,
	button {
		font: inherit;
	}

	input,
	textarea {
		width: 100%;
		max-width: 100%;
		padding: 0.75rem;
		border: 1px solid #64748b;
		border-radius: 0.375rem;
		background: #ffffff;
		color: #111111;
	}

	button {
		width: auto;
		justify-self: start;
		padding: 0.75rem 1rem;
		border: 1px solid #334155;
		border-radius: 0.375rem;
		background: #f8fafc;
		color: #111111;
		cursor: pointer;
	}

	button:hover {
		background: #e2e8f0;
	}

	header nav button {
		font-weight: 500;
		white-space: nowrap;
	}

	textarea {
		min-height: 10rem;
		resize: vertical;
	}

	ul {
		padding-left: 1.25rem;
	}

	pre {
		padding: 0.75rem;
		border: 1px solid #d0d7de;
		border-radius: 0.375rem;
		background: #f8fafc;
		overflow-x: auto;
		white-space: pre-wrap;
		word-break: break-word;
	}

	:focus {
		outline: none;
	}

	:focus-visible {
		outline: 3px solid #1d4ed8;
		outline-offset: 2px;
	}

	@media (max-width: 40rem) {
		header {
			padding: 0.75rem;
		}

		main {
			padding: 0.75rem;
			padding-bottom: 1.5rem;
		}

		nav {
			align-items: stretch;
		}

		.nav-primary,
		.nav-user-cluster {
			width: 100%;
		}

		.nav-user-cluster {
			margin-left: 0;
			justify-content: stretch;
			text-align: left;
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
			padding-top: 0.5rem;
			border-top: 1px solid #e2e8f0;
		}

		.nav-user {
			max-width: none;
			text-align: left;
		}

		nav a,
		nav button,
		nav .nav-user {
			width: 100%;
		}

		.inline-form {
			display: block;
			width: 100%;
		}

		button {
			width: 100%;
			justify-self: stretch;
		}
	}
`;

export function handleStyles(response: ServerResponse): void {
	sendCss(response, APP_CSS);
}