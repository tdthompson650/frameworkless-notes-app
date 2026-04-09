TRUNCATE TABLE notes RESTART IDENTITY;

ALTER TABLE notes
    ADD COLUMN user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_notes_user_id_created_at
    ON notes(user_id, created_at DESC, id DESC);