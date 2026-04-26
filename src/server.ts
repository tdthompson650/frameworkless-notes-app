import http from 'node:http';

import { db } from './db.js';
import { isUniqueViolationError } from './db/errors.js';
import {
	createNote,
	deleteNoteByIdForUser,
	getNoteByIdForUser,
	getNotesByUserId,
} from './notes/note.repo.js';
import {
	AppError,
	InvalidCsrfTokenError,
	MethodNotAllowedError,
	NotFoundError,
	TooManyRequestsError,
	UnsupportedMediaTypeError,
} from './http/errors.js';
import { sendErrorResponse, sendRedirect } from './http/response.js';
import { isFormUrlEncoded, parseFormData, readFormBody } from './http/request.js';
import { checkRateLimit, getClientIp } from './http/rate-limit.js';
import {
	getConfirmDeleteNoteIdFromPath,
	getDeleteNoteIdFromPath,
	getNoteIdFromPath,
} from './notes/note.paths.js';
import type { NoteId } from './notes/note.types.js';
import { flattenNoteFieldErrors, validateNoteInput } from './notes/note.validation.js';
import {
	handleDeleteNoteConfirm,
	handleNotesIndex,
	handleNotesNew,
	handleNoteShow,
} from './notes/note.views.js';
import { logError, logErrorSummary, logInfo, logWarn } from './utils/logger.js';
import { handleHome } from './views/home.js';
import { handleStyles } from './assets/styles.js';
import {
	AUTH_RATE_LIMIT_WINDOW_MS,
	LOGIN_MAX_ATTEMPTS_PER_WINDOW,
	SIGNUP_MAX_ATTEMPTS_PER_WINDOW,
} from './config/constants.js';
import { getPort } from './config/env.js';
import { handleLoginNew, handleSignupNew } from './auth/auth.views.js';
import {
	type SignupFieldErrors,
	flattenLoginFieldErrors,
	flattenSignupFieldErrors,
	validateLoginInput,
	validateSignupInput,
} from './auth/auth.validation.js';
import {
	createSession,
	createUser,
	deleteSessionByTokenHash,
	getUserByEmail,
} from './auth/auth.repo.js';
import {
	consumePasswordVerificationTime,
	hashPassword,
	verifyPassword,
} from './auth/password.js';
import {
	createClearedPreAuthCsrfCookie,
	createClearedSessionCookie,
	createPreAuthCsrfCookie,
	createSessionCookie,
	getPreAuthCsrfTokenFromRequest,
} from './auth/auth.cookie.js';
import { getSessionExpiresAt } from './auth/auth.constants.js';
import { generateCsrfToken, isValidCsrfToken } from './auth/csrf.js';
import { generateSessionToken, hashSessionToken } from './auth/session.js';
import {
	getAuthContext,
	getCurrentSession,
	getCurrentUser,
	type AuthContext,
} from './auth/auth.session.js';

/**
 * Main HTTP server: route matching, request parsing, auth, rate limits, and note CRUD.
 *
 * Security (cross-cutting): production cookies use `Secure`; POST bodies are size-limited;
 * state-changing forms require CSRF (pre-auth cookie + form for login/signup; session-bound
 * token for everything after). GET routes do not change server state.
 *
 * See also: `http/headers.ts` (CSP, framing), `auth/csrf.ts`, `http/rate-limit.ts`.
 */

const port = getPort();

/**
 * Reused validation errors for duplicate email so responses match the `UNIQUE` race path
 * (same user-facing message). Security: consistent messaging also avoids email enumeration
 * via different error text.
 */
const SIGNUP_DUPLICATE_EMAIL_FIELD_ERRORS: SignupFieldErrors = {
	email: ['An account with that email already exists.'],
	password: [],
	confirmPassword: [],
};

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

/** Security: `Secure` cookies require HTTPS (set in production). */
function shouldUseSecureCookies(): boolean {
	return process.env.NODE_ENV === 'production';
}

/**
 * Security: first-party signup/login forms need a CSRF secret before a session row exists;
 * this stores it in a short-lived `pre_auth_csrf` cookie and mirrors it in hidden fields.
 */
function getOrCreatePreAuthCsrfToken(
	request: http.IncomingMessage,
	response: http.ServerResponse
): string {
	const existingToken = getPreAuthCsrfTokenFromRequest(request);

	if (existingToken) {
		return existingToken;
	}

	const token = generateCsrfToken();

	response.setHeader(
		'Set-Cookie',
		createPreAuthCsrfCookie(token, shouldUseSecureCookies())
	);

	return token;
}

async function requireAuthContext(
	request: http.IncomingMessage,
	response: http.ServerResponse
): Promise<AuthContext | null> {
	const auth = await getAuthContext(request);

	if (!auth) {
		sendRedirect(response, '/login');
		return null;
	}

	return auth;
}

/** Security: throws 429 with `Retry-After` when the client exceeded the in-memory cap. */
function enforceRateLimit(
	response: http.ServerResponse,
	allowed: boolean,
	retryAfterSeconds: number,
	message: string
): void {
	if (allowed) {
		return;
	}

	response.setHeader('Retry-After', String(retryAfterSeconds));
	throw new TooManyRequestsError(message);
}

const server = http.createServer(async (request, response) => {
	try {
		const method = request.method ?? 'GET';
		const effectiveMethod = method === 'HEAD' ? 'GET' : method;
		const requestUrl = request.url ?? '/';
		// Base URL is only for parsing path/query; host comes from the live request in production.
		const parsedUrl = new URL(
			requestUrl,
			`http://${request.headers.host ?? 'localhost'}`
		);
		const pathname = parsedUrl.pathname;
		const start = Date.now();

		response.on('finish', () => {
			const durationMs = Date.now() - start;
			logInfo(
				`Request finished: ${method} ${pathname} -> ${response.statusCode} (${durationMs}ms)`
			);
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
				const auth = await getAuthContext(request);
				handleHome(
					response,
					auth?.user.email ?? null,
					auth?.session.csrfToken ?? null
				);
				return;
			}

			if (pathname === '/signup') {
				const currentUser = await getCurrentUser(request);

				if (currentUser) {
					sendRedirect(response, '/notes');
					return;
				}

				const csrfToken = getOrCreatePreAuthCsrfToken(request, response);
				handleSignupNew(response, { csrfToken });
				return;
			}

			if (pathname === '/login') {
				const currentUser = await getCurrentUser(request);

				if (currentUser) {
					sendRedirect(response, '/notes');
					return;
				}

				const csrfToken = getOrCreatePreAuthCsrfToken(request, response);
				handleLoginNew(response, { csrfToken });
				return;
			}

			if (pathname === '/notes') {
				const auth = await requireAuthContext(request, response);

				if (!auth) {
					return;
				}

				const notes = await getNotesByUserId(auth.user.id);
				handleNotesIndex(
					response,
					notes,
					auth.user.email,
					auth.session.csrfToken
				);
				return;
			}

			if (pathname === '/notes/new') {
				const auth = await requireAuthContext(request, response);

				if (!auth) {
					return;
				}

				handleNotesNew(
					response,
					{ csrfToken: auth.session.csrfToken },
					200,
					auth.user.email,
					auth.session.csrfToken
				);
				return;
			}

			if (noteId !== null) {
				const auth = await requireAuthContext(request, response);

				if (!auth) {
					return;
				}

				const note = await getNoteByIdForUser(noteId, auth.user.id);

				if (!note) {
					throw new NotFoundError('Note not found');
				}

				handleNoteShow(
					response,
					note,
					auth.session.csrfToken,
					auth.user.email,
					auth.session.csrfToken
				);
				return;
			}
		}

		if (method === 'POST') {
			if (pathname === '/signup') {
				if (!isFormUrlEncoded(request)) {
					throw new UnsupportedMediaTypeError();
				}

				const formBody = await readFormBody(request);
				const formFields = parseFormData(formBody);

				const clientIp = getClientIp(request);
				const signupRateLimit = checkRateLimit(
					`signup:${clientIp}`,
					SIGNUP_MAX_ATTEMPTS_PER_WINDOW,
					AUTH_RATE_LIMIT_WINDOW_MS
				);

				enforceRateLimit(
					response,
					signupRateLimit.allowed,
					signupRateLimit.retryAfterSeconds,
					'Too many signup attempts. Please try again later.'
				);

				const rawEmail = formFields.email ?? '';
				const rawPassword = formFields.password ?? '';
				const rawConfirmPassword = formFields.confirmPassword ?? '';

				const preAuthCsrfToken = getPreAuthCsrfTokenFromRequest(request);

				if (!isValidCsrfToken(formFields.csrfToken, preAuthCsrfToken ?? '')) {
					throw new InvalidCsrfTokenError();
				}

				const result = validateSignupInput(
					rawEmail,
					rawPassword,
					rawConfirmPassword
				);

				if (!result.ok) {
					logWarn('Signup validation errors', flattenSignupFieldErrors(result.fieldErrors));
					handleSignupNew(
						response,
						{
							fieldErrors: result.fieldErrors,
							email: result.value.email,
							csrfToken: preAuthCsrfToken ?? '',
						},
						400
					);
					return;
				}

				const existingUser = await getUserByEmail(result.value.email);

				if (existingUser) {
					handleSignupNew(
						response,
						{
							fieldErrors: SIGNUP_DUPLICATE_EMAIL_FIELD_ERRORS,
							email: result.value.email,
							csrfToken: preAuthCsrfToken ?? '',
						},
						400
					);
					return;
				}

				const passwordHash = await hashPassword(result.value.password);
				let user;
				try {
					user = await createUser(result.value.email, passwordHash);
				} catch (error) {
					if (isUniqueViolationError(error)) {
						handleSignupNew(
							response,
							{
								fieldErrors: SIGNUP_DUPLICATE_EMAIL_FIELD_ERRORS,
								email: result.value.email,
								csrfToken: preAuthCsrfToken ?? '',
							},
							400
						);
						return;
					}
					throw error;
				}

				const sessionToken = generateSessionToken();
				const sessionTokenHash = hashSessionToken(sessionToken);
				const csrfToken = generateCsrfToken();
				const sessionExpiresAt = getSessionExpiresAt();

				await createSession(user.id, sessionTokenHash, csrfToken, sessionExpiresAt);

				response.setHeader('Set-Cookie', [
					createSessionCookie(
						sessionToken,
						sessionExpiresAt,
						shouldUseSecureCookies()
					),
					createClearedPreAuthCsrfCookie(shouldUseSecureCookies()),
				]);

				sendRedirect(response, '/');
				return;
			}

			if (pathname === '/login') {
				if (!isFormUrlEncoded(request)) {
					throw new UnsupportedMediaTypeError();
				}

				const formBody = await readFormBody(request);
				const formFields = parseFormData(formBody);
				const rawEmail = formFields.email ?? '';
				const rawPassword = formFields.password ?? '';

				const clientIp = getClientIp(request);
				const loginIpRateLimit = checkRateLimit(
					`login:${clientIp}`,
					LOGIN_MAX_ATTEMPTS_PER_WINDOW,
					AUTH_RATE_LIMIT_WINDOW_MS
				);

				enforceRateLimit(
					response,
					loginIpRateLimit.allowed,
					loginIpRateLimit.retryAfterSeconds,
					'Too many login attempts. Please try again later.'
				);

				const preAuthCsrfToken = getPreAuthCsrfTokenFromRequest(request);

				if (!isValidCsrfToken(formFields.csrfToken, preAuthCsrfToken ?? '')) {
					throw new InvalidCsrfTokenError();
				}

				const result = validateLoginInput(rawEmail, rawPassword);

				if (result.ok) {
					const loginIdentityRateLimit = checkRateLimit(
						`login:${clientIp}:${result.value.email}`,
						LOGIN_MAX_ATTEMPTS_PER_WINDOW,
						AUTH_RATE_LIMIT_WINDOW_MS
					);

					enforceRateLimit(
						response,
						loginIdentityRateLimit.allowed,
						loginIdentityRateLimit.retryAfterSeconds,
						'Too many login attempts. Please try again later.'
					);
				}

				if (!result.ok) {
					logWarn('Login validation errors', flattenLoginFieldErrors(result.fieldErrors));
					handleLoginNew(
						response,
						{
							fieldErrors: result.fieldErrors,
							email: result.value.email,
							csrfToken: preAuthCsrfToken ?? '',
						},
						400
					);
					return;
				}

				const user = await getUserByEmail(result.value.email);

				if (!user) {
					// Security: run Argon2 work even if the user is missing to reduce timing leaks.
					await consumePasswordVerificationTime(result.value.password);

					handleLoginNew(
						response,
						{
							authErrorMessage: 'Invalid email or password.',
							email: result.value.email,
							csrfToken: preAuthCsrfToken ?? '',
						},
						400
					);
					return;
				}

				const isValidPassword = await verifyPassword(
					user.passwordHash,
					result.value.password
				);

				if (!isValidPassword) {
					handleLoginNew(
						response,
						{
							authErrorMessage: 'Invalid email or password.',
							email: result.value.email,
							csrfToken: preAuthCsrfToken ?? '',
						},
						400
					);
					return;
				}

				const sessionToken = generateSessionToken();
				const sessionTokenHash = hashSessionToken(sessionToken);
				const csrfToken = generateCsrfToken();
				const sessionExpiresAt = getSessionExpiresAt();

				await createSession(user.id, sessionTokenHash, csrfToken, sessionExpiresAt);

				response.setHeader('Set-Cookie', [
					createSessionCookie(
						sessionToken,
						sessionExpiresAt,
						shouldUseSecureCookies()
					),
					createClearedPreAuthCsrfCookie(shouldUseSecureCookies()),
				]);

				sendRedirect(response, '/notes');
				return;
			}

			if (pathname === '/logout') {
				if (!isFormUrlEncoded(request)) {
					throw new UnsupportedMediaTypeError();
				}

				const formBody = await readFormBody(request);
				const formFields = parseFormData(formBody);
				const session = await getCurrentSession(request);

				if (
					session &&
					!isValidCsrfToken(formFields.csrfToken, session.csrfToken)
				) {
					throw new InvalidCsrfTokenError();
				}

				if (session) {
					await deleteSessionByTokenHash(session.tokenHash);
				}

				response.setHeader(
					'Set-Cookie',
					createClearedSessionCookie(shouldUseSecureCookies())
				);

				sendRedirect(response, '/login');
				return;
			}

			if (deleteNoteId !== null) {
				const auth = await requireAuthContext(request, response);

				if (!auth) {
					return;
				}

				if (!isFormUrlEncoded(request)) {
					throw new UnsupportedMediaTypeError();
				}

				const formBody = await readFormBody(request);
				const formFields = parseFormData(formBody);

				if (!isValidCsrfToken(formFields.csrfToken, auth.session.csrfToken)) {
					throw new InvalidCsrfTokenError();
				}

				const note = await getNoteByIdForUser(deleteNoteId, auth.user.id);

				if (!note) {
					throw new NotFoundError('Note not found');
				}

				handleDeleteNoteConfirm(
					response,
					note,
					auth.session.csrfToken,
					auth.user.email,
					auth.session.csrfToken
				);
				return;
			}

			if (confirmDeleteNoteId !== null) {
				const auth = await requireAuthContext(request, response);

				if (!auth) {
					return;
				}

				if (!isFormUrlEncoded(request)) {
					throw new UnsupportedMediaTypeError();
				}

				const formBody = await readFormBody(request);
				const formFields = parseFormData(formBody);

				if (!isValidCsrfToken(formFields.csrfToken, auth.session.csrfToken)) {
					throw new InvalidCsrfTokenError();
				}

				const deletedNote = await deleteNoteByIdForUser(
					confirmDeleteNoteId,
					auth.user.id
				);

				if (!deletedNote) {
					throw new NotFoundError('Note not found');
				}

				sendRedirect(response, '/notes');
				return;
			}

			if (pathname === '/notes') {
				const auth = await requireAuthContext(request, response);

				if (!auth) {
					return;
				}

				if (!isFormUrlEncoded(request)) {
					throw new UnsupportedMediaTypeError();
				}

				const formBody = await readFormBody(request);
				const formFields = parseFormData(formBody);

				if (!isValidCsrfToken(formFields.csrfToken, auth.session.csrfToken)) {
					throw new InvalidCsrfTokenError();
				}

				const rawTitle = formFields.title ?? '';
				const rawBody = formFields.body ?? '';

				const result = validateNoteInput(rawTitle, rawBody);

				if (!result.ok) {
					logWarn('Validation errors', flattenNoteFieldErrors(result.fieldErrors));
					handleNotesNew(
						response,
						{
							fieldErrors: result.fieldErrors,
							title: result.value.title,
							body: result.value.body,
							csrfToken: auth.session.csrfToken,
						},
						400,
						auth.user.email,
						auth.session.csrfToken
					);
					return;
				}

				const newNote = await createNote(auth.user.id, result.value);
				logInfo('Created note', { id: newNote.id, userId: auth.user.id });

				sendRedirect(response, '/notes');
				return;
			}
		}

		// Explicit method-to-route allowlist: anything not handled above is 404 or 405.
		if (isMethodNotAllowed(pathname, effectiveMethod, '/styles.css', ['GET'])) {
			throw new MethodNotAllowedError(['GET']);
		}

		if (isMethodNotAllowed(pathname, effectiveMethod, '/', ['GET'])) {
			throw new MethodNotAllowedError(['GET']);
		}

		if (isMethodNotAllowed(pathname, effectiveMethod, '/signup', ['GET', 'POST'])) {
			throw new MethodNotAllowedError(['GET', 'POST']);
		}

		if (isMethodNotAllowed(pathname, effectiveMethod, '/login', ['GET', 'POST'])) {
			throw new MethodNotAllowedError(['GET', 'POST']);
		}

		if (isMethodNotAllowed(pathname, method, '/logout', ['POST'])) {
			throw new MethodNotAllowedError(['POST']);
		}

		if (
			isMethodNotAllowed(pathname, effectiveMethod, '/notes', ['GET', 'POST'])
		) {
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
		if (
			error instanceof AppError &&
			error.statusCode >= 400 &&
			error.statusCode < 500
		) {
			logWarn('Request handling error', {
				name: error.name,
				statusCode: error.statusCode,
				message: error.message,
			});
		} else {
			logError('Request handling error', error);
		}

		// If a handler already started the response, we cannot send JSON/HTML error body.
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
		logErrorSummary('Database connection failed', error);
	}
});
