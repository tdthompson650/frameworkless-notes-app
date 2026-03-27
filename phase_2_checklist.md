## 1. Shared types and boundaries
- [ x ] Decide whether the repo returns raw DB rows (`created_at`) or mapped app objects (`createdAt`)
- [ x ] Create `src/notes/note.types.ts`
- [ x ] Add a shared `NoteRow` type for DB results
- [ x ] Add a shared validated note input type (for example `CreateNoteInput`)
- [ x ] Remove repeated inline note object types
- [ x ] Decide on one canonical note ID type
- [ ] Make boundaries explicit between:
  - [ ] raw request input
  - [ ] validated input
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
- [ ] Add reusable helpers for:
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
- [ ] Normalize raw note input consistently
- [ x ] Decide and apply trimming rules for title and body
- [ x ] Centralize note field rules
- [ x ] Validate required fields
- [ x ] Validate max lengths
- [ ] Define a typed validated note input shape for successful validation output
- [ ] Keep raw form input separate from validated note input
- [ ] Return structured validation results
- [ ] Keep field-specific error messages in one place
- [ ] Consider DB-level constraints for note validation rules as defense in depth

---

## 6. Notes repo cleanup
- [ ] Move note DB queries into `src/notes/note.repo.ts`
- [ ] Type DB query results with `NoteRow`
- [ ] Keep DB-specific shapes inside the repo layer when possible
- [ ] Consider splitting:
  - [ ] list row type
  - [ ] full note row type
- [ ] Keep pool/config setup separate from note query logic

---

## 7. Note view extraction
- [ ] Create `src/notes/note.views.ts`
- [ ] Move notes index page rendering into the note views module
- [ ] Move new note form rendering into the note views module
- [ ] Move note detail page rendering into the note views module
- [ ] Move delete confirmation page rendering into the note views module
- [ ] Keep large HTML template strings out of route handlers

---

## 8. Routing cleanup
- [ ] Reduce inline route branching in the main server file
- [ ] Centralize route matching
- [ ] Centralize path param extraction
- [ ] Centralize note ID validation
- [ ] Replace ad hoc note path helpers with a cleaner matcher approach
- [ ] Add method-not-allowed handling where appropriate
- [ ] Keep route handlers small and focused

---

## 9. Security headers
- [ ] Create a shared security header helper/module
- [ ] Add `Content-Security-Policy`
- [ ] Add `X-Content-Type-Options: nosniff`
- [ ] Add `Referrer-Policy`
- [ ] Add framing protection
- [ ] Attach security headers through shared response helpers

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
- [ ] Create shared app error types
- [ ] Add error categories for:
  - [ ] bad request
  - [ ] validation error
  - [ ] not found
  - [ ] unsupported media type
  - [ ] payload too large
  - [ ] internal error
- [ ] Centralize error-to-response mapping
- [ ] Keep user-facing 4xx responses safe and clear
- [ ] Keep user-facing 5xx responses generic
- [ ] Log enough detail internally for debugging
- [ ] Avoid leaking stack traces or DB details to users
- [ ] Set `process.exitCode = 1` in `init-db.ts` on initialization failure
- [ ] Consider centralizing request parsing errors into a broader app error module later

---

## 11. Config cleanup
- [ ] Load `dotenv` once in the entrypoint only
- [ ] Move environment/config loading into a dedicated config module if helpful
- [ ] Move shared constants into a shared constants/config file
- [ ] Keep runtime config separate from app logic

---

## 12. Final verification pass
- [ ] Re-test `GET /`
- [ ] Re-test `GET /notes`
- [ ] Re-test `GET /notes/new`
- [ ] Re-test `GET /notes/:id`
- [ ] Re-test successful `POST /notes`
- [ ] Re-test validation failure on `POST /notes`
- [ ] Re-test wrong content type on `POST /notes`
- [ ] Re-test oversized body on `POST /notes`
- [ ] Re-test `POST /notes/:id/delete`
- [ ] Re-test `POST /notes/:id/delete/confirm`
- [ ] Re-test unknown routes
- [ ] Verify security headers are present
- [ ] Verify no stack traces or DB details reach users
- [ ] Verify no user-controlled data reaches HTML unescaped

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