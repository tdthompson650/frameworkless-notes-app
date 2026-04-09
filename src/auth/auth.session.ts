import type { IncomingMessage } from 'node:http';

import { getSessionTokenFromRequest } from './auth.cookie.js';
import { deleteSessionByTokenHash, getSessionByTokenHash, getUserById } from './auth.repo.js';
import type { Session, User } from './auth.types.js';
import { hashSessionToken } from './session.js';

export type AuthContext = {
	session: Session;
	user: User;
};

export async function getCurrentSession(
	request: IncomingMessage
): Promise<Session | null> {
	const token = getSessionTokenFromRequest(request);

	if (!token) {
		return null;
	}

	const tokenHash = hashSessionToken(token);
	const session = await getSessionByTokenHash(tokenHash);

	if (!session) {
		return null;
	}

	if (session.expiresAt <= new Date()) {
		await deleteSessionByTokenHash(tokenHash);
		return null;
	}

	return session;
}

export async function getAuthContext(
	request: IncomingMessage
): Promise<AuthContext | null> {
	const session = await getCurrentSession(request);

	if (!session) {
		return null;
	}

	const user = await getUserById(session.userId);

	if (!user) {
		return null;
	}

	return {
		session,
		user,
	};
}

export async function getCurrentUser(
	request: IncomingMessage
): Promise<User | null> {
	const authContext = await getAuthContext(request);
	return authContext?.user ?? null;
}