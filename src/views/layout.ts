import { escapeHtml } from '../utils/escape.js';

// `title` is escaped here.
// `content` must be trusted HTML that was built safely by the caller.
// Escape any user-controlled values before interpolating them into `content`.
export function renderPage(title: string, content: string): string {
    return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <link rel="stylesheet" href="/styles.css">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <header>
            <nav aria-label="Main navigation">
                <a href="/">Home</a>
                <a href="/notes">Notes</a>
                <a href="/notes/new">New note</a>
            </nav>
        </header>

        <main>
            ${content}
        </main>
    </body>
</html>`;
}
