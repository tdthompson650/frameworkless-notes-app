export type NoteId = string;

export type NoteRow = {
    id: NoteId;
    title: string;
    body: string;
    created_at: Date;
};

export type Note = {
    id: NoteId;
    title: string;
    body: string;
    createdAt: Date;
};

export type CreateNoteInput = {
    title: string;
    body: string;
};

export function mapNoteRow(row: NoteRow): Note {
    return {
        id: row.id,
        title: row.title,
        body: row.body,
        createdAt: row.created_at,
    };
}