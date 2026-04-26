import { escapeHtml } from '../utils/escape.js';

export type ErrorDocumentOptions = {
	title: string;
	heading: string;
	message: string;
};

/**
 * Standalone error HTML (minimal chrome). All interpolated strings are escaped (XSS).
 */
export function renderErrorDocument(options: ErrorDocumentOptions): string {
	const { title, heading, message } = options;

	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <main>
      <h1>${escapeHtml(heading)}</h1>
      <p>${escapeHtml(message)}</p>
    </main>
  </body>
</html>`;
}
