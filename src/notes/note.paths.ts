import type { NoteId } from './note.types.js';

export function notePath(id: NoteId): string {
    return `/notes/${encodeURIComponent(id)}`;
}

export function noteDeletePath(id: NoteId): string {
    return `${notePath(id)}/delete`;
}

export function noteDeleteConfirmPath(id: NoteId): string {
    return `${notePath(id)}/delete/confirm`;
}

export function getNoteIdFromPath(pathname: string): NoteId | null {
    const match = /^\/notes\/(\d+)$/.exec(pathname);

    if (!match) {
        return null;
    }

    return match[1] ?? null;
}

export function getDeleteNoteIdFromPath(pathname: string): NoteId | null {
    const match = /^\/notes\/(\d+)\/delete$/.exec(pathname);

    if (!match) {
        return null;
    }

    return match[1] ?? null;
}

export function getConfirmDeleteNoteIdFromPath(pathname: string): NoteId | null {
    const match = /^\/notes\/(\d+)\/delete\/confirm$/.exec(pathname);

    if (!match) {
        return null;
    }

    return match[1] ?? null;
}
