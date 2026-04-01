import type { ServerResponse } from 'node:http';

import { sendHtml } from '../http/response.js';
import { noteDeleteConfirmPath, noteDeletePath, notePath } from './note.paths.js';
import type { Note } from './note.types.js';
import { escapeHtml } from '../utils/escape.js';
import { renderPage } from '../views/layout.js';

export function handleNotesIndex(response: ServerResponse, notes: Note[]) {
    const noteList = notes.map((note) => `
        <li>
            <a href="${notePath(note.id)}">${escapeHtml(note.title)}</a>
        </li>
    `).join('');

    const content = `
        <h1>Notes</h1>
        <p><a href="/notes/new">Create a new note</a></p>
        ${notes.length > 0 ? `
        <ul>
            ${noteList}
        </ul>
        ` : '<p>No notes yet.</p>'}
    `;

    const html = renderPage('Notes', content);
    sendHtml(response, html);
}

export function handleNotesNew(
    response: ServerResponse,
    options?: {
        errors?: string[];
        title?: string;
        body?: string;
    },
    status: number = 200
) {
    const errors = options?.errors ?? [];
    const title = options?.title ?? '';
    const body = options?.body ?? '';

    const errorHtml = errors.length > 0
        ? `
        <div>
            <h2>Please fix the following errors:</h2>
            <ul>
                ${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}
            </ul>
        </div>
        `
        : '';

    const content = `
        <h1>New note</h1>

        ${errorHtml}

        <form method="post" action="/notes">
            <div>
                <label for="title">Title</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    value="${escapeHtml(title)}"
                >
            </div>

            <div>
                <label for="body">Body</label>
                <textarea id="body" name="body" rows="8" cols="40">${escapeHtml(body)}</textarea>
            </div>

            <div>
                <button type="submit">Create note</button>
            </div>
        </form>
    `;

    const html = renderPage('New note', content);
    sendHtml(response, html, status);
}

export function handleNoteShow(
    response: ServerResponse,
    note: Note
) {
    const content = `
        <h1>${escapeHtml(note.title)}</h1>
        <pre>${escapeHtml(note.body)}</pre>

        <form method="post" action="${noteDeletePath(note.id)}">
            <button type="submit">Delete note</button>
        </form>

        <p><a href="/notes">Back to notes</a></p>
    `;

    const html = renderPage(`Note ${note.id}`, content);
    sendHtml(response, html);
}

export function handleDeleteNoteConfirm(
    response: ServerResponse,
    note: Note
) {
    const content = `
        <h1>Delete note</h1>
        <p>Are you sure you want to delete this note?</p>

        <h2>${escapeHtml(note.title)}</h2>
        <pre>${escapeHtml(note.body)}</pre>

        <form method="post" action="${noteDeleteConfirmPath(note.id)}">
            <button type="submit">Yes, delete this note</button>
        </form>

        <p><a href="${notePath(note.id)}">Cancel</a></p>
    `;

    const html = renderPage('Delete note', content);
    sendHtml(response, html);
}
