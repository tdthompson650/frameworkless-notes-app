import type { IncomingMessage } from 'node:http';
import { MAX_REQUEST_BODY_SIZE } from '../config/constants.js';
import { PayloadTooLargeError } from './errors.js';

export async function readFormBody(request: IncomingMessage): Promise<string> {
    return await new Promise((resolve, reject) => {
        let body = '';
        let bodySize = 0;
        let settled = false;

        request.on('data', (chunk: Buffer) => {
            if (settled) {
                return;
            }

            bodySize += chunk.length;

            if (bodySize > MAX_REQUEST_BODY_SIZE) {
                settled = true;
                reject(new PayloadTooLargeError());
                request.destroy();
                return;
            }

            body += chunk.toString();
        });

        request.on('end', () => {
            if (settled) {
                return;
            }

            settled = true;
            resolve(body);
        });

        request.on('error', (error) => {
            if (settled) {
                return;
            }

            settled = true;
            reject(error);
        });
    });
}

export function parseFormData(rawBody: string): Record<string, string> {
    const params = new URLSearchParams(rawBody);
    const fields: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
        fields[key] = value;
    }

    return fields;
}

export function isFormUrlEncoded(request: IncomingMessage): boolean {
    const contentTypeHeader = request.headers['content-type'];

    if (typeof contentTypeHeader !== 'string') return false;

    return contentTypeHeader.startsWith('application/x-www-form-urlencoded');
}
