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
 * When true, the first `X-Forwarded-For` hop is used as the client IP (e.g. behind Render).
 * Security: must stay **false** when the Node server is directly reachable, or attackers can
 * spoof the header and evade IP-based rate limits and logs.
 */
export function getTrustForwardedFor(): boolean {
    const raw = process.env.TRUST_FORWARDED_FOR?.trim().toLowerCase();

    return raw === 'true' || raw === '1';
}