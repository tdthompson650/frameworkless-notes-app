import type { ServerResponse } from 'node:http';
import { sendCss } from '../http/response.js';

const APP_CSS = `
    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        font-family: Arial, sans-serif;
        line-height: 1.5;
    }

    header {
        padding: 1rem;
        border-bottom: 1px solid #ccc;
    }

    nav {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    nav a {
        display: inline-block;
        padding: 0.25rem 0;
    }

    a {
        color: inherit;
    }

    main {
        max-width: 48rem;
        margin: 0 auto;
        padding: 1rem;
    }

    form {
        display: grid;
        gap: 1rem;
    }

    form div {
        display: grid;
        gap: 0.35rem;
    }

    input,
    textarea,
    button {
        font: inherit;
    }

    input,
    textarea {
        width: 100%;
        padding: 0.5rem;
    }

    button {
        width: auto;
        justify-self: start;
        padding: 0.5rem 0.75rem;
    }

    textarea {
        min-height: 10rem;
    }

    ul {
        padding-left: 1.25rem;
    }

    pre {
        padding: 0.75rem;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
    }
`;

export function handleStyles(response: ServerResponse): void {
    sendCss(response, APP_CSS);
}