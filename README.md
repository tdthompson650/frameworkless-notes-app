# Frameworkless Notes App

A frameworkless, server-rendered notes application built with Node’s `http` module, TypeScript, and PostgreSQL.

Repository: [github.com/tdthompson650/frameworkless-notes-app](https://github.com/tdthompson650/frameworkless-notes-app)

This project was built as a fundamentals-first portfolio piece to practice web security, HTTP, server rendering, accessibility-minded UI design, and responsive layout without relying on a web framework.

## Why this project exists

I wanted to build a real full-stack application while staying close to the underlying platform and avoiding framework abstractions.

This project focuses on:

- raw HTTP request/response handling
- server-rendered HTML
- PostgreSQL-backed persistence
- authentication and authorization
- practical web security
- responsive, accessible UI fundamentals
- clear code organization without a framework

## Tech stack

- Node.js
- TypeScript
- PostgreSQL
- `pg`
- `argon2`
- `dotenv` (load `.env` in development)
- built-in Node `http` server
- server-rendered HTML string templates
- app-served CSS

## Getting started

**Prerequisites:** [Node.js](https://nodejs.org/) (LTS recommended), [PostgreSQL](https://www.postgresql.org/), and `npm`.

1. Clone the repository and install dependencies: `npm install`
2. Create a database and copy `.env.example` to `.env`. Set `DATABASE_URL` to your PostgreSQL connection string (see comments in [`.env.example`](.env.example)).
3. Run migrations: `npm run db:migrate`
4. Start the dev server: `npm run dev` — then open [http://localhost:3000](http://localhost:3000) (or the port in `PORT` if set)

For a production build, run `npm run build` and `npm start` (serves `dist/server.js`). Ensure production env vars (e.g. `NODE_ENV`, `DATABASE_URL`, `PORT`, and optionally `TRUST_FORWARDED_FOR` behind a reverse proxy) are set on the host; do not commit `.env`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run with `tsx watch` for local development |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled app (`node dist/server.js`) |
| `npm run db:migrate` | Apply SQL migrations in `src/migrations/` |
| `npm run db:init` | Alias for `db:migrate` |
| `npm run audit` | Run `npm audit` |

## No frameworks

This app does not use a web framework such as Next.js, Express, Fastify, Nest, or React.

Routing, request parsing, response handling, HTML rendering, auth flow orchestration, and security headers are all handled directly in the application code using the Node runtime and a small set of focused libraries.

## Features

- user signup
- user login/logout
- authenticated, per-user notes
- note creation and deletion
- confirmation step for destructive actions
- server-rendered UI
- responsive layout for small screens
- keyboard-friendly navigation and visible focus styles

## Security highlights

This project was intentionally built with security as a core concern.

Implemented protections include:

- Argon2 password hashing
- server-side sessions
- hashed session tokens at rest
- CSRF protection for authenticated flows
- CSRF protection for pre-auth flows
- authorization checks so users can only access their own notes
- parameterized SQL queries
- escaped HTML output in views
- cookie security flags (`HttpOnly`, `SameSite`, `Secure` in production)
- security headers including CSP and related hardening headers
- basic rate limiting for signup/login abuse resistance
- generic login error messaging
- login timing hardening to reduce account-enumeration signals

## Accessibility and responsive design

This app was built with accessibility and responsive design in mind.

Work completed includes:

- semantic HTML structure
- skip link to main content
- visible keyboard focus states
- labeled form controls
- keyboard-usable auth and note flows
- responsive navigation and form layout
- small-screen reflow testing
- manual accessibility-focused checks during development

## Project structure

```text
src/
  assets/        CSS handler
  auth/          auth, sessions, CSRF, password utilities
  config/        env and constants
  db/            DB connection, migration runner, DB-related errors
  http/          request/response helpers, errors, headers, rate limiting
  migrations/    SQL migrations
  notes/         note repo, views, validation, paths, types
  utils/         logging and shared helpers
  views/         shared layout, home page, and error page
  server.ts      raw HTTP server and route orchestration
```
