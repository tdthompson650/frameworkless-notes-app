import http, { type ServerResponse } from 'node:http';
import dotenv from 'dotenv';

import { db, createNote, getAllNotes, getNoteById, deleteNoteById } from './db.js';
import {
  sendCss,
  sendHtml,
  sendMethodNotAllowed,
  sendNotFound,
  sendPayloadTooLarge,
  sendRedirect,
  sendServerError,
  sendText,
  sendUnsupportedMediaType,
} from './http/response.js';
import { isFormUrlEncoded, parseFormData, readFormBody, RequestBodyTooLargeError } from './http/request.js';
import type { Note, NoteId } from './notes/note.types.js';
import { normalizeNoteInput, validateNoteInput } from './notes/note.validation.js';
import { escapeHtml } from './views/escape.js';
import { renderPage } from './views/layout.js';

dotenv.config();

const port = Number(process.env.PORT) || 3000;

function getNoteIdFromPath(pathname: string): NoteId | null {
  const match = /^\/notes\/(\d+)$/.exec(pathname);

  if (!match) {
    return null;
  }

  return match[1] ?? null;
}

function getDeleteNoteIdFromPath(pathname: string): NoteId | null {
  const match = /^\/notes\/(\d+)\/delete$/.exec(pathname);

  if (!match) {
    return null;
  }

  return match[1] ?? null;
}

function getConfirmDeleteNoteIdFromPath(pathname: string): NoteId | null {
  const match = /^\/notes\/(\d+)\/delete\/confirm$/.exec(pathname);

  if (!match) {
    return null;
  }

  return match[1] ?? null;
}

function notePath(id: NoteId): string {
  return `/notes/${encodeURIComponent(id)}`;
}

function noteDeletePath(id: NoteId): string {
  return `${notePath(id)}/delete`;
}

function noteDeleteConfirmPath(id: NoteId): string {
  return `${notePath(id)}/delete/confirm`;
}

function handleStyles(response: ServerResponse) {
  const css = `
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      line-height: 1.5;
    }

    header {
      padding: 1rem;
      border-bottom: 1px solid #ccc;
    }

    nav {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    nav a {
      display: inline-block;
      padding: 0.25rem 0;
    }

    a {
      color: inherit;
    }

    main {
      max-width: 48rem;
      margin: 0 auto;
      padding: 1rem;
    }

    form {
      display: grid;
      gap: 1rem;
    }

    form div {
      display: grid;
      gap: 0.35rem;
    }

    input,
    textarea,
    button {
      font: inherit;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.5rem;
    }

    button {
      width: auto;
      justify-self: start;
      padding: 0.5rem 0.75rem;
    }

    textarea {
      min-height: 10rem;
    }

    ul {
      padding-left: 1.25rem;
    }

    pre {
      padding: 0.75rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `;

  sendCss(response, css);
}

function handleHome(response: ServerResponse) {
  const content = `
    <h1>Home page</h1>
  `;

  const html = renderPage('Home page', content);
  sendHtml(response, html);
}


function handleNotesIndex(response: ServerResponse, notes: Note[]) {
  const noteList = notes.map((note) => `
    <li>
      <a href="${notePath(note.id)}">${escapeHtml(note.title)}</a>
    </li>
  `).join('');

  const content = `
    <h1>Notes</h1>
    <p><a href="/notes/new">Create a new note</a></p>
    ${noteList.length > 0 ? `
    <ul>
      ${noteList}
    </ul>
    ` : '<p>No notes yet.</p>'}
  `;

  const html = renderPage('Notes', content);
  sendHtml(response, html);
}

function handleNotesNew(
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

function handleCreateNote(response: ServerResponse) {
  sendRedirect(response, '/notes');
}

function handleNotFound(response: ServerResponse) {
  sendNotFound(response);
}

function handleNoteShow(
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

function handleDeleteNote(response: ServerResponse) {
  sendRedirect(response, '/notes');
}

function handleDeleteNoteConfirm(
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

const server = http.createServer(async (request, response) => {
  try {
    const method = request.method ?? 'GET';
    const requestUrl = request.url ?? '/';
    const parsedUrl = new URL(requestUrl, `http://${request.headers.host ?? 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const start = Date.now();

    response.on('finish', () => {
      const durationMs = Date.now() - start;
      console.log(`${method} ${pathname} -> ${response.statusCode} (${durationMs}ms)`);
    });

    console.log('--- incoming request ---');


    if (method === 'GET' && pathname === '/styles.css') {
      handleStyles(response);
      return;
    }

    if (method === 'GET' && pathname === '/') {
      handleHome(response);
      return;
    }

    if (method === 'GET' && pathname === '/notes') {
      const notes = await getAllNotes();
      handleNotesIndex(response, notes);
      return;
    }

    if (method === 'GET' && pathname === '/notes/new') {
      handleNotesNew(response);
      return;
    }

    if (pathname === '/styles.css' && method !== 'GET') {
      sendMethodNotAllowed(response, ['GET']);
      return;
    }

    if (pathname === '/' && method !== 'GET') {
      sendMethodNotAllowed(response, ['GET']);
      return;
    }

    if (pathname === '/notes' && method !== 'GET' && method !== 'POST') {
      sendMethodNotAllowed(response, ['GET', 'POST']);
      return;
    }

    if (pathname === '/notes/new' && method !== 'GET') {
      sendMethodNotAllowed(response, ['GET']);
      return;
    }

    const noteId = getNoteIdFromPath(pathname);
    const deleteNoteId = getDeleteNoteIdFromPath(pathname);
    const confirmDeleteNoteId = getConfirmDeleteNoteIdFromPath(pathname);

    if (confirmDeleteNoteId !== null && method !== 'POST') {
      sendMethodNotAllowed(response, ['POST']);
      return;
    }

    if (deleteNoteId !== null && method !== 'POST') {
      sendMethodNotAllowed(response, ['POST']);
      return;
    }

    if (noteId !== null && method !== 'GET') {
      sendMethodNotAllowed(response, ['GET']);
      return;
    }

    if (method === 'GET' && noteId !== null) {
      const note = await getNoteById(noteId);

      if (!note) {
        handleNotFound(response);
        return;
      }

      handleNoteShow(response, note);
      return;
    }

    if (method === 'POST' && deleteNoteId !== null) {
      const note = await getNoteById(deleteNoteId);

      if (!note) {
        handleNotFound(response);
        return;
      }

      handleDeleteNoteConfirm(response, note);
      return;
    }

    if (method === 'POST' && confirmDeleteNoteId !== null) {
      const deletedNote = await deleteNoteById(confirmDeleteNoteId);

      if (!deletedNote) {
        handleNotFound(response);
        return;
      }

      handleDeleteNote(response);
      return;
    }

    if (method === 'POST' && pathname === '/notes') {
      if (!isFormUrlEncoded(request)) {
        sendUnsupportedMediaType(response);
        return;
      }

      const formBody = await readFormBody(request);
      const formFields = parseFormData(formBody);
      const rawTitle = formFields.title ?? '';
      const rawBody = formFields.body ?? '';

      const { title, body } = normalizeNoteInput(rawTitle, rawBody);

      const errors = validateNoteInput(title, body);
      if (errors.length > 0) {
        console.log('validation errors:', errors);
        handleNotesNew(response, { errors, title, body }, 400);
        return;
      }

      const newNote = await createNote(title, body);
      console.log('created note:', newNote);

      handleCreateNote(response);
      return;
    }

    handleNotFound(response);
  } catch (error) {
    console.error('Request handling error:', error);

    if (error instanceof RequestBodyTooLargeError) {
      sendPayloadTooLarge(response);
      return;
    }

    if (!response.headersSent) {
      sendServerError(response);
      return;
    }

    response.end();
  }
});

server.listen(port, async () => {
  try {
    const result = await db.query('SELECT 1 AS connected');
    console.log('Database connection ok:', result.rows[0]);
    console.log(`Server running at http://localhost:${port}`);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});