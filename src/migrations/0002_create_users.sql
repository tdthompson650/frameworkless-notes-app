CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
CONSTRAINT users_email_not_blank
        CHECK (btrim(email) <> ''),

    CONSTRAINT users_email_max_length
        CHECK (char_length(email) <= 320),

    CONSTRAINT users_password_hash_not_blank
        CHECK (btrim(password_hash) <> '')
);