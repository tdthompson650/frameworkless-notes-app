import http from 'node:http';

import { db } from './db.js';
import {
    createNote,
    deleteNoteById,
    getAllNotes,
    getNoteById,
} from './notes/note.repo.js';
import {
    MethodNotAllowedError,
    NotFoundError,
    UnsupportedMediaTypeError,
    AppError,
} from './http/errors.js';
import { sendRedirect, sendErrorResponse } from './http/response.js';
import { isFormUrlEncoded, parseFormData, readFormBody } from './http/request.js';
import {
    getConfirmDeleteNoteIdFromPath,
    getDeleteNoteIdFromPath,
    getNoteIdFromPath,
} from './notes/note.paths.js';
import type { NoteId } from './notes/note.types.js';
import { validateNoteInput } from './notes/note.validation.js';
import {
    handleDeleteNoteConfirm,
    handleNotesIndex,
    handleNotesNew,
    handleNoteShow,
} from './notes/note.views.js';
import { logInfo, logWarn, logError } from './utils/logger.js';
import { handleHome } from './views/home.js';
import { handleStyles } from './assets/styles.js';
import { getPort } from './config/env.js';

const port = getPort();

function isMethodNotAllowed(
    pathname: string,
    method: string,
    routePath: string,
    allowedMethods: string[]
): boolean {
    return pathname === routePath && !allowedMethods.includes(method);
}

function isDynamicMethodNotAllowed(
    matchedId: NoteId | null,
    method: string,
    allowedMethods: string[]
): boolean {
    return matchedId !== null && !allowedMethods.includes(method);
}

const server = http.createServer(async (request, response) => {
    try {
        const method = request.method ?? 'GET';
        const effectiveMethod = method === 'HEAD' ? 'GET' : method;
        const requestUrl = request.url ?? '/';
        const parsedUrl = new URL(
            requestUrl,
            `http://${request.headers.host ?? 'localhost'}`
        );
        const pathname = parsedUrl.pathname;
        const start = Date.now();

        response.on('finish', () => {
            const durationMs = Date.now() - start;
            logInfo(`Request finished: ${method} ${pathname} -> ${response.statusCode} (${durationMs}ms)`);
        });

        logInfo(`Incoming request: ${method} ${pathname}`);

        const noteId = getNoteIdFromPath(pathname);
        const deleteNoteId = getDeleteNoteIdFromPath(pathname);
        const confirmDeleteNoteId = getConfirmDeleteNoteIdFromPath(pathname);

        if (effectiveMethod === 'GET') {
            if (pathname === '/styles.css') {
                handleStyles(response);
                return;
            }

            if (pathname === '/') {
                handleHome(response);
                return;
            }

            if (pathname === '/notes') {
                const notes = await getAllNotes();
                handleNotesIndex(response, notes);
                return;
            }

            if (pathname === '/notes/new') {
                handleNotesNew(response);
                return;
            }

            if (noteId !== null) {
                const note = await getNoteById(noteId);

                if (!note) {
                    throw new NotFoundError('Note not found');
                }

                handleNoteShow(response, note);
                return;
            }
        }

        if (method === 'POST') {
            if (deleteNoteId !== null) {
                const note = await getNoteById(deleteNoteId);

                if (!note) {
                    throw new NotFoundError('Note not found');
                }

                handleDeleteNoteConfirm(response, note);
                return;
            }

            if (confirmDeleteNoteId !== null) {
                const deletedNote = await deleteNoteById(confirmDeleteNoteId);

                if (!deletedNote) {
                    throw new NotFoundError('Note not found');
                }

                sendRedirect(response, '/notes');
                return;
            }

            if (pathname === '/notes') {
                if (!isFormUrlEncoded(request)) {
                    throw new UnsupportedMediaTypeError();
                }

                const formBody = await readFormBody(request);
                const formFields = parseFormData(formBody);
                const rawTitle = formFields.title ?? '';
                const rawBody = formFields.body ?? '';

                const result = validateNoteInput(rawTitle, rawBody);

                if (!result.ok) {
                    logWarn('Validation errors', result.errors);
                    handleNotesNew(
                        response,
                        {
                            errors: result.errors,
                            title: result.value.title,
                            body: result.value.body,
                        },
                        400
                    );
                    return;
                }

                const newNote = await createNote(result.value.title, result.value.body);
                logInfo('Created note', { id: newNote.id });

                sendRedirect(response, '/notes');
                return;
            }
        }

        if (isMethodNotAllowed(pathname, effectiveMethod, '/styles.css', ['GET'])) {
            throw new MethodNotAllowedError(['GET']);
        }

        if (isMethodNotAllowed(pathname, effectiveMethod, '/', ['GET'])) {
            throw new MethodNotAllowedError(['GET']);
        }

        if (isMethodNotAllowed(pathname, effectiveMethod, '/notes', ['GET', 'POST'])) {
            throw new MethodNotAllowedError(['GET', 'POST']);
        }

        if (isMethodNotAllowed(pathname, effectiveMethod, '/notes/new', ['GET'])) {
            throw new MethodNotAllowedError(['GET']);
        }

        if (isDynamicMethodNotAllowed(confirmDeleteNoteId, method, ['POST'])) {
            throw new MethodNotAllowedError(['POST']);
        }

        if (isDynamicMethodNotAllowed(deleteNoteId, method, ['POST'])) {
            throw new MethodNotAllowedError(['POST']);
        }

        if (isDynamicMethodNotAllowed(noteId, effectiveMethod, ['GET'])) {
            throw new MethodNotAllowedError(['GET']);
        }

        throw new NotFoundError();
    } catch (error) {
        if (error instanceof AppError && error.statusCode >= 400 && error.statusCode < 500) {
            logWarn('Request handling error', {
                name: error.name,
                statusCode: error.statusCode,
                message: error.message,
            });
        } else {
            logError('Request handling error', error);
        }

        if (!response.headersSent) {
            sendErrorResponse(response, error);
            return;
        }

        response.end();
    }
});

server.listen(port, async () => {
    try {
        const result = await db.query('SELECT 1 AS connected');
        logInfo('Database connection ok', result.rows[0]);
        logInfo(`Server running at http://localhost:${port}`);
    } catch (error) {
        logError('Database connection failed', error);
    }
});