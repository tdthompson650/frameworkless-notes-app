import http, { type ServerResponse } from 'node:http';
import dotenv from 'dotenv';

import { db, createNote, getAllNotes, getNoteById, deleteNoteById } from './db.js';

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const MAX_REQUEST_BODY_SIZE = 10_000;
const MAX_TITLE_LENGTH = 200;
const MAX_NOTE_BODY_LENGTH = 10_000;

function sendText(response: ServerResponse, body: string, status: number = 200) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end(body);
}

function sendNotFound(response: ServerResponse) {
  sendText(response, 'Not found', 404);
}

function sendHtml(response: ServerResponse, html: string, status: number = 200) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(html);
}

function sendRedirect(response: ServerResponse, location: string, status: number = 303) {
  response.statusCode = status;
  response.setHeader('Location', location);
  response.end();
}

function sendServerError(response: ServerResponse) {
  sendText(response, 'Internal Server Error', 500);
}

async function readFormBody(request: http.IncomingMessage): Promise<string> {
  return await new Promise((resolve, reject) => {
    let body = '';
    let bodySize = 0;

    request.on('data', (chunk: Buffer) => {
      bodySize += chunk.length;

      if (bodySize > MAX_REQUEST_BODY_SIZE) {
        reject(new Error('Request body too large'));
        request.destroy();
        return;
      }

      body += chunk.toString();
    });

    request.on('end', () => {
      resolve(body);
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
}

function parseFormData(rawBody: string): Record<string, string> {
  const params = new URLSearchParams(rawBody);
  const fields: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    fields[key] = value;
  }

  return fields;
}

function isFormUrlEncoded(request: http.IncomingMessage): boolean {
  const contentTypeHeader = request.headers['content-type'];

  if (typeof contentTypeHeader !== 'string') return false;

  return contentTypeHeader.startsWith('application/x-www-form-urlencoded');
}

function validateNoteInput(title: string, body: string): string[] {
  const errors: string[] = [];

  if (title.trim() === '') {
    errors.push('Title is required');
  }

  if (title.length > MAX_TITLE_LENGTH) {
    errors.push('Title must be 200 characters or fewer.');
  }

  if (body.trim() === '') {
    errors.push('Body is required');
  }

  if (body.length > MAX_NOTE_BODY_LENGTH) {
    errors.push('Body must be 10,000 characters or fewer.');
  }

  return errors;
}

function getNoteIdFromPath(pathname: string): string | null {
  const match = /^\/notes\/(\d+)$/.exec(pathname);

  if (!match) {
    return null;
  }

  return match[1] ?? null;
}

function getDeleteNoteIdFromPath(pathname: string): string | null {
  const match = /^\/notes\/(\d+)\/delete$/.exec(pathname);

  if (!match) {
    return null;
  }

  return match[1] ?? null;
}

function getConfirmDeleteNoteIdFromPath(pathname: string): string | null {
  const match = /^\/notes\/(\d+)\/delete\/confirm$/.exec(pathname);

  if (!match) {
    return null;
  }

  return match[1] ?? null;
}

function renderPage(title: string, content: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <link rel="stylesheet" href="/styles.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <header>
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/notes">Notes</a>
        <a href="/notes/new">New note</a>
      </nav>
    </header>

    <main>
      ${content}
    </main>
  </body>
</html>
`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sendCss(response: ServerResponse, css: string, status: number = 200) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/css; charset=utf-8');
  response.end(css);
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


function handleNotesIndex(response: ServerResponse, notes: Array<{ id: string; title: string; body: string }>) {
  const noteList = notes.map((note) => `
    <li>
      <a href="/notes/${note.id}">${escapeHtml(note.title)}</a>
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
  note: { id: string; title: string; body: string }
) {
  const content = `
    <h1>${escapeHtml(note.title)}</h1>
    <pre>${escapeHtml(note.body)}</pre>

    <form method="post" action="/notes/${note.id}/delete">
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
  note: { id: string; title: string; body: string }
) {
  const content = `
    <h1>Delete note</h1>
    <p>Are you sure you want to delete this note?</p>

    <h2>${escapeHtml(note.title)}</h2>
    <pre>${escapeHtml(note.body)}</pre>

    <form method="post" action="/notes/${note.id}/delete/confirm">
      <button type="submit">Yes, delete this note</button>
    </form>

    <p><a href="/notes/${note.id}">Cancel</a></p>
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

    const noteId = getNoteIdFromPath(pathname);
    const deleteNoteId = getDeleteNoteIdFromPath(pathname);
    const confirmDeleteNoteId = getConfirmDeleteNoteIdFromPath(pathname);

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
        sendText(response, 'Unsupported Media Type', 415);
        return;
      }

      const formBody = await readFormBody(request);
      const formFields = parseFormData(formBody);
      const title = formFields.title ?? '';
      const body = formFields.body ?? '';

      const errors = validateNoteInput(title, body);
      if (errors.length > 0) {
        console.log('validation errors:', errors);
        handleNotesNew(response, { errors, title, body }, 400);
        return;
      }

      const newNote = await createNote(title.trim(), body.trim());
      console.log('created note:', newNote);

      handleCreateNote(response);
      return;
    }

    handleNotFound(response);
  } catch (error) {
    console.error('Request handling error:', error);

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