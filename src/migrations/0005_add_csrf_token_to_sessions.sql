ALTER TABLE sessions
    ADD COLUMN csrf_token TEXT;

UPDATE sessions
SET csrf_token =
    md5(random()::text || clock_timestamp()::text || id::text) ||
    md5(clock_timestamp()::text || random()::text || id::text)
WHERE csrf_token IS NULL;

ALTER TABLE sessions
    ALTER COLUMN csrf_token SET NOT NULL;

ALTER TABLE sessions
    ADD CONSTRAINT sessions_csrf_token_not_blank
        CHECK (btrim(csrf_token) <> '');