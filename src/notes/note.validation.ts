import type { CreateNoteInput } from './note.types.js';
import { MAX_NOTE_TITLE_LENGTH, MAX_NOTE_BODY_LENGTH } from '../config/constants.js';

const NOTE_VALIDATION_MESSAGES = {
    titleRequired: 'Title is required',
    titleTooLong: `Title must be ${MAX_NOTE_TITLE_LENGTH} characters or fewer.`,
    bodyRequired: 'Body is required',
    bodyTooLong: `Body must be ${MAX_NOTE_BODY_LENGTH.toLocaleString()} characters or fewer.`,
} as const;

type NoteValidationResult =
    | { ok: true; value: CreateNoteInput }
    | { ok: false; errors: string[]; value: CreateNoteInput };

function normalizeNoteInput(title: string, body: string): CreateNoteInput {
    return {
        title: title.trim(),
        body: body.trim(),
    };
}

export function validateNoteInput(title: string, body: string): NoteValidationResult {
    const value = normalizeNoteInput(title, body);
    const errors: string[] = [];

    if (value.title === '') {
        errors.push(NOTE_VALIDATION_MESSAGES.titleRequired);
    }

    if (value.title.length > MAX_NOTE_TITLE_LENGTH) {
        errors.push(NOTE_VALIDATION_MESSAGES.titleTooLong);
    }

    if (value.body === '') {
        errors.push(NOTE_VALIDATION_MESSAGES.bodyRequired);
    }

    if (value.body.length > MAX_NOTE_BODY_LENGTH) {
        errors.push(NOTE_VALIDATION_MESSAGES.bodyTooLong);
    }

    if (errors.length > 0) {
        return { ok: false, errors, value };
    }

    return { ok: true, value };
}
