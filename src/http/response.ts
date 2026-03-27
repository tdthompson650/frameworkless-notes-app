import type { ServerResponse } from 'node:http';

export function sendText(
  response: ServerResponse,
  body: string,
  status: number = 200
): void {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end(body);
}

export function sendHtml(
  response: ServerResponse,
  html: string,
  status: number = 200
): void {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(html);
}

export function sendCss(
  response: ServerResponse,
  css: string,
  status: number = 200
): void {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/css; charset=utf-8');
  response.end(css);
}

export function sendRedirect(
  response: ServerResponse,
  location: string,
  status: number = 303
): void {
  response.statusCode = status;
  response.setHeader('Location', location);
  response.end();
}

export function sendNotFound(response: ServerResponse): void {
  sendText(response, 'Not found', 404);
}

export function sendServerError(response: ServerResponse): void {
  sendText(response, 'Internal Server Error', 500);
}

export function sendMethodNotAllowed(
  response: ServerResponse,
  allowedMethods: string[]
): void {
  response.statusCode = 405;
  response.setHeader('Allow', allowedMethods.join(', '));
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end('Method Not Allowed');
}

export function sendUnsupportedMediaType(response: ServerResponse): void {
  sendText(response, 'Unsupported Media Type', 415);
}

export function sendPayloadTooLarge(response: ServerResponse): void {
  sendText(response, 'Payload Too Large', 413);
}
