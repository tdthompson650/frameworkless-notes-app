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