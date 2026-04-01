## 1. Shared types and boundaries
- [ x ] Decide whether the repo returns raw DB rows (`created_at`) or mapped app objects (`createdAt`)
- [ x ] Create `src/notes/note.types.ts`
- [ x ] Add a shared `NoteRow` type for DB results
- [ x ] Add a shared validated note input type (for example `CreateNoteInput`)
- [ x ] Remove repeated inline note object types
- [ x ] Decide on one canonical note ID type
- [ x ] Make boundaries explicit between:
  - [ x ] raw request input
  - [ x ] validated input
  - [ x ] DB rows
  - [ x ] escaped output
- [ x ] Fix note timestamp types to match runtime `pg` behavior (`TIMESTAMPTZ` -> `Date`)
- [ x ] Decide whether app types should keep `Date` objects or convert them to strings at the repo view boundary
- [ x ] Keep `Date` objects in app/repo types and format only in views when needed
- [ x ] Use `NoteId` in route param helper return types where appropriate

---

## 2. Escaping and shared layout
- [ x ] Extract `escapeHtml()` into a shared helper
- [ x ] Move `renderPage()` into a shared layout module
- [ x ] Make `renderPage()` safe by default by escaping the page title internally
- [ x ] Keep `renderPage(content)` as trusted HTML only; escape user-controlled values before building page content
- [ x ] Review all remaining HTML string interpolation points
- [ x ] Ensure user-controlled data is always escaped before rendering
- [ x ] URL-encode dynamic path segments when building links and form actions

---

## 3. Shared response helpers
- [ x ] Create a shared HTTP response helper module
- [ x ] Centralize HTML responses
- [ x ] Centralize text responses
- [ x ] Centralize redirects
- [ x ] Centralize safe error responses
- [ x ] Add reusable helpers for:
  - [ x ] 404 Not Found
  - [ x ] 405 Method Not Allowed
  - [ x ] 413 Payload Too Large
  - [ x ] 415 Unsupported Media Type
  - [ x ] 500 Internal Server Error
- [ x ] Centralize CSS responses
- [ x ] Use `sendUnsupportedMediaType()` in `server.ts` for form content-type failures
- [ x ] Use `sendPayloadTooLarge()` in `server.ts` when the body limit is exceeded
- [ x ] Use `sendMethodNotAllowed()` where a known route is hit with the wrong HTTP method

---

## 4. Shared request parsing helpers
- [ x ] Create a shared request helper module
- [ x ] Centralize request body reading
- [ x ] Centralize form parsing
- [ x ] Enforce request body size limits
- [ x ] Introduce a specific error for oversized bodies
- [ x ] Reject unsupported POST content types cleanly
- [ x ] Make malformed request handling consistent
- [ x ] Return `413` for oversized request bodies instead of generic `500`
- [ x ] Move request body size limit into a shared constants/config file

---

## 5. Validation improvements
- [ x ] Move note validation into `src/notes/note.validation.ts`
- [ x ] Normalize raw note input consistently
- [ x ] Decide and apply trimming rules for title and body
- [ x ] Centralize note field rules
- [ x ] Validate required fields
- [ x ] Validate max lengths
- [ x ] Define a typed validated note input shape for successful validation output
- [ x ] Keep raw form input separate from validated note input
- [ x ] Return structured validation results
- [ x ] Keep field-specific error messages in one place
- [ x ] Keep field-specific error messages in one place
- [ x ] Consider DB-level constraints for note validation rules as defense in depth
- [ x ] Add DB-level CHECK constraints that mirror note validation rules

---

## 6. Notes repo cleanup
- [ x ] Move note DB queries into `src/notes/note.repo.ts`
- [ x ] Keep note persistence logic out of `db.ts`
- [ x ] Type DB query results with `NoteRow`
- [ x ] Keep DB-specific shapes inside the repo layer when possible
- [ x ] Keep pool/config setup separate from note query logic
- [ ] Consider splitting list row type and full note row type later

---

## 7. Note view extraction
- [ x ] Create `src/notes/note.views.ts`
- [ x ] Move notes index page rendering into the note views module
- [ x ] Move new note form rendering into the note views module
- [ x ] Move note detail page rendering into the note views module
- [ x ] Move delete confirmation page rendering into the note views module
- [ x ] Keep large HTML template strings out of route handlers

---

## 8. Routing cleanup
- [ x ] Move note path builders and route param parsers into a shared note routes/path helper module
- [ x ] Centralize route matching for note routes
- [ x ] Reduce repeated pathname + method branching in `server.ts`
- [ x ] Keep route handlers small and focused
- [ x ] Keep route-specific method rules close to route definitions
- [ x ] Keep 404 vs 405 behavior consistent across known routes
- [ x ] Group route handling by HTTP method where it improves readability without changing 404/405 behavior
- [ ] Consider extracting note route handling into `src/notes/note.routes.ts`
- [ x ] Move remaining non-route rendering helpers out of `server.ts` (`handleHome`, `handleStyles`)

---

## 9. Security headers
- [ x ] Create a shared security header helper/module
- [ x ] Add `Content-Security-Policy`
- [ x ] Add `X-Content-Type-Options: nosniff`
- [ x ] Add `Referrer-Policy`
- [ x ] Add framing protection
- [ x ] Attach security headers through shared response helpers
- [ x ] Split security headers into common headers vs document-only headers

### Suggested baseline CSP
- [ ] `default-src 'none'`
- [ ] `style-src 'self' 'unsafe-inline'`
- [ ] `img-src 'self' data:`
- [ ] `form-action 'self'`
- [ ] `base-uri 'none'`
- [ ] `frame-ancestors 'none'`
- [ ] `script-src 'none'`

---

## 10. Error handling and logging
- [ x ] Create shared app error types
- [ x ] Move request-specific errors into a shared app error module when appropriate
- [ x ] Centralize error-to-response mapping
- [ x ] Keep expected client errors as intentional 4xx responses
- [ x ] Keep unexpected failures as safe generic 500 responses
- [ x ] Avoid leaking stack traces or DB details to users
- [ x ] Keep internal logging useful and consistent
- [ x ] Set `process.exitCode = 1` in `init-db.ts` on initialization failure
- [ x ] Consider whether to support `HEAD` for safe GET routes later
- [ ] Support `HEAD` for safe GET routes by reusing GET route handling and omitting response bodies
- [ x ] Move request/routing failures toward thrown typed app errors for consistency
- [ x ] Add typed app errors for common request failures (`NotFoundError`, `MethodNotAllowedError`, `UnsupportedMediaTypeError`)
- [ x ] Keep form validation failures as structured results instead of thrown exceptions
- [ x ] Finish moving request/routing failures to thrown typed app errors
- [ x ] Remove response helpers that become unused after the error-model migration
- [ x ] Remove helper functions that become unused after the error-model migration

---

## 11. Config cleanup
- [ x ] Load `dotenv` once in the entrypoint only
- [ x ] Move environment/config loading into a dedicated config module if helpful
- [ x ] Move shared constants into a shared constants/config file
- [ x ] Keep runtime config separate from app logic

---

## 12. Final verification pass
- [ x ] Re-test `GET /`
- [ x ] Re-test `GET /notes`
- [ x ] Re-test `GET /notes/new`
- [ x ] Re-test `GET /notes/:id`
- [ x ] Re-test successful `POST /notes`
- [ x ] Re-test validation failure on `POST /notes`
- [ x ] Re-test wrong content type on `POST /notes`
- [ x ] Re-test oversized body on `POST /notes`
- [ x ] Re-test `POST /notes/:id/delete`
- [ x ] Re-test `POST /notes/:id/delete/confirm`
- [ x ] Re-test unknown routes
- [ x ] Re-test 405 behavior on known routes
- [ x ] Re-test `HEAD` on safe GET routes
- [ x ] Verify security headers are present where expected
- [ x ] Verify DB constraints match app validation rules
- [ x ] Verify no stack traces or DB details reach users
- [ x ] Remove any remaining unused imports/helpers
- [ x ] Do one final codebase sanity pass for Phase 2

---

# Recommended implementation order
- [ ] Step 1: shared note types
- [ ] Step 2: escape helper + harden `renderPage()`
- [ ] Step 3: shared response helpers
- [ ] Step 4: shared request parsing helpers + body limit handling
- [ ] Step 5: note validation module
- [ ] Step 6: note repo typing cleanup
- [ ] Step 7: note views extraction
- [ ] Step 8: routing cleanup
- [ ] Step 9: security headers
- [ ] Step 10: error types + final verification