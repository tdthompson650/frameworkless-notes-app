/**
 * Note list/detail/delete views. User-generated titles and bodies go through `escapeHtml`;
 * CSRF tokens are echoed from server state into hidden fields.
 */

import type { ServerResponse } from 'node:http';

import { sendHtml } from '../http/response.js';
import {
	noteDeleteConfirmPath,
	noteDeletePath,
	notePath,
} from './note.paths.js';
import type { Note } from './note.types.js';
import { emptyNoteFieldErrors, type NoteFieldErrors } from './note.validation.js';
import { escapeHtml } from '../utils/escape.js';
import { buildRenderPageOptions, renderPage } from '../views/layout.js';

export function handleNotesIndex(
	response: ServerResponse,
	notes: Note[],
	currentUserEmail?: string | null,
	logoutCsrfToken?: string | null
) {
	const noteList = notes
		.map(
			(note) => `
        <li>
          <a href="${notePath(note.id)}">${escapeHtml(note.title)}</a>
        </li>
      `
		)
		.join('');

	const content = `
    <h1>Notes</h1>
    <p><a href="/notes/new">Create a new note</a></p>
    ${
			notes.length > 0
				? `
        <ul>
          ${noteList}
        </ul>
      `
				: '<p>No notes yet.</p>'
		}
  `;

	const html = renderPage(
		'Notes',
		content,
		buildRenderPageOptions(currentUserEmail, logoutCsrfToken)
	);
	sendHtml(response, html);
}

function renderNoteFieldErrorBlock(elementId: string, messages: string[]): string {
	if (messages.length === 0) {
		return '';
	}

	const items = messages.map((msg) => `<li>${escapeHtml(msg)}</li>`).join('');

	return `
        <div id="${elementId}" class="field-error">
          <ul>${items}</ul>
        </div>`;
}

function renderNoteFormErrorSummary(summaryId: string, headingId: string, messages: string[]): string {
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

function flattenNoteMessages(fieldErrors: NoteFieldErrors): string[] {
	return [...fieldErrors.title, ...fieldErrors.body];
}

function noteAutofocusAttr(fieldErrors: NoteFieldErrors): { title: string; body: string } {
	const focus = ' autofocus';

	if (fieldErrors.title.length > 0) {
		return { title: focus, body: '' };
	}

	if (fieldErrors.body.length > 0) {
		return { title: '', body: focus };
	}

	return { title: '', body: '' };
}

function describedByAttr(...ids: string[]): string {
	const unique = [...new Set(ids.filter((id) => id !== ''))];

	if (unique.length === 0) {
		return '';
	}

	return ` aria-describedby="${unique.join(' ')}"`;
}

export function handleNotesNew(
	response: ServerResponse,
	options?: {
		fieldErrors?: NoteFieldErrors;
		title?: string;
		body?: string;
		csrfToken?: string;
	},
	status: number = 200,
	currentUserEmail?: string | null,
	logoutCsrfToken?: string | null
) {
	const fieldErrors = options?.fieldErrors ?? emptyNoteFieldErrors();
	const title = options?.title ?? '';
	const body = options?.body ?? '';
	const csrfToken = options?.csrfToken ?? '';

	const summaryMessages = flattenNoteMessages(fieldErrors);
	const summaryHtml = renderNoteFormErrorSummary(
		'note-new-error-summary',
		'note-new-error-summary-heading',
		summaryMessages
	);

	const titleDescribedBy = fieldErrors.title.length > 0 ? 'note-title-error' : '';
	const bodyDescribedBy = fieldErrors.body.length > 0 ? 'note-body-error' : '';
	const focus = noteAutofocusAttr(fieldErrors);

	const content = `
    <h1>New note</h1>

    ${summaryHtml}

    <form method="post" action="/notes">
      <input
        type="hidden"
        name="csrfToken"
        value="${escapeHtml(csrfToken)}"
      >

      <div>
        <label for="title">Title</label>
        ${renderNoteFieldErrorBlock('note-title-error', fieldErrors.title)}
        <input
          id="title"
          name="title"
          type="text"
          value="${escapeHtml(title)}"
          ${fieldErrors.title.length > 0 ? 'aria-invalid="true"' : ''}${describedByAttr(titleDescribedBy)}
          ${focus.title}
        >
      </div>

      <div>
        <label for="body">Body</label>
        ${renderNoteFieldErrorBlock('note-body-error', fieldErrors.body)}
        <textarea
          id="body"
          name="body"
          rows="8"
          cols="40"
          ${fieldErrors.body.length > 0 ? 'aria-invalid="true"' : ''}${describedByAttr(bodyDescribedBy)}
          ${focus.body}
        >${escapeHtml(body)}</textarea>
      </div>

      <div>
        <button type="submit">Create note</button>
      </div>
    </form>
  `;

	const html = renderPage(
		'New note',
		content,
		buildRenderPageOptions(currentUserEmail, logoutCsrfToken)
	);
	sendHtml(response, html, status);
}

export function handleNoteShow(
	response: ServerResponse,
	note: Note,
	csrfToken: string,
	currentUserEmail?: string | null,
	logoutCsrfToken?: string | null
) {
	const content = `
    <h1>${escapeHtml(note.title)}</h1>
    <pre>${escapeHtml(note.body)}</pre>

    <form method="post" action="${noteDeletePath(note.id)}">
      <input
        type="hidden"
        name="csrfToken"
        value="${escapeHtml(csrfToken)}"
      >
      <button type="submit">Delete note</button>
    </form>

    <p><a href="/notes">Back to notes</a></p>
  `;

	const html = renderPage(
		`Note ${note.id}`,
		content,
		buildRenderPageOptions(currentUserEmail, logoutCsrfToken)
	);
	sendHtml(response, html);
}

export function handleDeleteNoteConfirm(
	response: ServerResponse,
	note: Note,
	csrfToken: string,
	currentUserEmail?: string | null,
	logoutCsrfToken?: string | null
) {
	const content = `
    <h1>Delete note</h1>
    <p>Are you sure you want to delete this note?</p>

    <h2>${escapeHtml(note.title)}</h2>
    <pre>${escapeHtml(note.body)}</pre>

    <form method="post" action="${noteDeleteConfirmPath(note.id)}">
      <input
        type="hidden"
        name="csrfToken"
        value="${escapeHtml(csrfToken)}"
      >
      <button type="submit">Yes, delete this note</button>
    </form>

    <p><a href="${notePath(note.id)}">Cancel</a></p>
  `;

	const html = renderPage(
		'Delete note',
		content,
		buildRenderPageOptions(currentUserEmail, logoutCsrfToken)
	);
	sendHtml(response, html);
}