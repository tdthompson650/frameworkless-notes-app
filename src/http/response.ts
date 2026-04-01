import type { ServerResponse } from 'node:http';
import { applyCommonSecurityHeaders, applyDocumentSecurityHeaders } from './headers.js';
import { AppError, MethodNotAllowedError } from './errors.js';

export function sendErrorResponse(
    response: ServerResponse,
    error: unknown
): void {
    if (error instanceof MethodNotAllowedError) {
        response.setHeader('Allow', error.allowedMethods.join(', '));
        sendText(
            response,
            error.exposeMessage ? error.message : 'Internal Server Error',
            error.statusCode
        );
        return;
    }

    if (error instanceof AppError) {
        sendText(
            response,
            error.exposeMessage ? error.message : 'Internal Server Error',
            error.statusCode
        );
        return;
    }

    sendServerError(response);
}

function sendText(
    response: ServerResponse,
    body: string,
    status: number = 200
): void {
    const isHeadRequest = response.req?.method === 'HEAD';

    response.statusCode = status;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    applyCommonSecurityHeaders(response);
    response.end(isHeadRequest ? undefined : body);
}

export function sendHtml(
    response: ServerResponse,
    html: string,
    status: number = 200
): void {
    const isHeadRequest = response.req?.method === 'HEAD';

    response.statusCode = status;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    applyDocumentSecurityHeaders(response);
    response.end(isHeadRequest ? undefined : html);
}

export function sendCss(
    response: ServerResponse,
    css: string,
    status: number = 200
): void {
    const isHeadRequest = response.req?.method === 'HEAD';

    response.statusCode = status;
    response.setHeader('Content-Type', 'text/css; charset=utf-8');
    applyCommonSecurityHeaders(response);
    response.end(isHeadRequest ? undefined : css);
}

export function sendRedirect(
    response: ServerResponse,
    location: string,
    status: number = 303
): void {
    response.statusCode = status;
    response.setHeader('Location', location);
    applyCommonSecurityHeaders(response);
    response.end();
}

function sendServerError(response: ServerResponse): void {
    sendText(response, 'Internal Server Error', 500);
}
