import type { CreateNoteInput } from './note.types.js';

const MAX_TITLE_LENGTH = 200;
const MAX_NOTE_BODY_LENGTH = 10_000;

export function normalizeNoteInput(title: string, body: string): CreateNoteInput {
  return {
    title: title.trim(),
    body: body.trim(),
  };
}

export function validateNoteInput(title: string, body: string): string[] {
  const errors: string[] = [];

  if (title === '') {
    errors.push('Title is required');
  }

  if (title.length > MAX_TITLE_LENGTH) {
    errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
  }

  if (body === '') {
    errors.push('Body is required');
  }

  if (body.length > MAX_NOTE_BODY_LENGTH) {
    errors.push(`Body must be ${MAX_NOTE_BODY_LENGTH.toLocaleString()} characters or fewer.`);
  }

  return errors;
}
