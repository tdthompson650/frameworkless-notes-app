import * as argon2 from 'argon2';

const DUMMY_PASSWORD_HASH =
	'$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQxMjM0NTY3OA$k1Ut9z0qE8v0p4QmN4Jj2Qxj8j3vW8kQmC2n6d6L2yQ';

export async function hashPassword(password: string): Promise<string> {
	return argon2.hash(password);
}

export async function verifyPassword(
	passwordHash: string,
	password: string
): Promise<boolean> {
	return argon2.verify(passwordHash, password);
}

export async function consumePasswordVerificationTime(
	password: string
): Promise<void> {
	await argon2.verify(DUMMY_PASSWORD_HASH, password);
}