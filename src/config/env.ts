import dotenv from 'dotenv';

dotenv.config();

function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not set`);
    }

    return value;
}

export function getDatabaseUrl(): string {
    return getRequiredEnv('DATABASE_URL');
}

export function getPort(): number {
    const rawPort = process.env.PORT;

    if (!rawPort) {
        return 3000;
    }

    const port = Number(rawPort);

    if (!Number.isInteger(port) || port <= 0) {
        throw new Error('PORT must be a positive integer');
    }

    return port;
}

/**
 * When true, `X-Forwarded-For` is used for client IP (e.g. behind Render’s reverse proxy).
 * Keep false on a server exposed directly to the internet so clients cannot spoof the header.
 */
export function getTrustForwardedFor(): boolean {
    const raw = process.env.TRUST_FORWARDED_FOR?.trim().toLowerCase();

    return raw === 'true' || raw === '1';
}