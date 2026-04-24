import type { CreateNoteInput } from './note.types.js';
import { MAX_NOTE_TITLE_LENGTH, MAX_NOTE_BODY_LENGTH } from '../config/constants.js';

const NOTE_VALIDATION_MESSAGES = {
	titleRequired: 'Title is required',
	titleTooLong: `Title must be ${MAX_NOTE_TITLE_LENGTH} characters or fewer.`,
	bodyRequired: 'Body is required',
	bodyTooLong: `Body must be ${MAX_NOTE_BODY_LENGTH.toLocaleString()} characters or fewer.`,
} as const;

export type NoteFieldErrors = {
	title: string[];
	body: string[];
};

export function emptyNoteFieldErrors(): NoteFieldErrors {
	return { title: [], body: [] };
}

export function flattenNoteFieldErrors(fieldErrors: NoteFieldErrors): string[] {
	return [...fieldErrors.title, ...fieldErrors.body];
}

type NoteValidationResult =
	| { ok: true; value: CreateNoteInput }
	| { ok: false; fieldErrors: NoteFieldErrors; value: CreateNoteInput };

function normalizeNoteInput(title: string, body: string): CreateNoteInput {
	return {
		title: title.trim(),
		body: body.trim(),
	};
}

export function validateNoteInput(title: string, body: string): NoteValidationResult {
	const value = normalizeNoteInput(title, body);
	const fieldErrors = emptyNoteFieldErrors();

	if (value.title === '') {
		fieldErrors.title.push(NOTE_VALIDATION_MESSAGES.titleRequired);
	}

	if (value.title.length > MAX_NOTE_TITLE_LENGTH) {
		fieldErrors.title.push(NOTE_VALIDATION_MESSAGES.titleTooLong);
	}

	if (value.body === '') {
		fieldErrors.body.push(NOTE_VALIDATION_MESSAGES.bodyRequired);
	}

	if (value.body.length > MAX_NOTE_BODY_LENGTH) {
		fieldErrors.body.push(NOTE_VALIDATION_MESSAGES.bodyTooLong);
	}

	const hasErrors = fieldErrors.title.length > 0 || fieldErrors.body.length > 0;

	if (hasErrors) {
		return { ok: false, fieldErrors, value };
	}

	return { ok: true, value };
}
