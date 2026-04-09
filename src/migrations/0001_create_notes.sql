CREATE TABLE IF NOT EXISTS notes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT notes_title_not_blank
        CHECK (btrim(title) <> ''),

    CONSTRAINT notes_body_not_blank
        CHECK (btrim(body) <> ''),

    CONSTRAINT notes_title_max_length
        CHECK (char_length(title) <= 200),

    CONSTRAINT notes_body_max_length
        CHECK (char_length(body) <= 10000)
);