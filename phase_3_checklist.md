# Phase 3 — Recommended Implementation Order

## Goal
Build secure authentication, server-side sessions, authorization, and CSRF protection in the most sensible order for the frameworkless notes app.

---

## 0. Phase Setup / Guardrails
- [ x ] Confirm Phase 3 will use `argon2` for password hashing
- [ x ] Keep the app server-rendered and functional without client-side JavaScript
- [ x ] Keep `db.ts` limited to pool creation
- [ x ] Keep typed app errors for request/routing/auth failures
- [ x ] Keep structured validation results for form validation failures
- [ x ] Keep escaping at render time
- [ x ] Keep SQL parameterized everywhere

---

## 1. Replace Destructive DB Setup with Migrations
- [ x ] Stop relying on destructive `init-db.ts` behavior for normal development
- [ x ] Create a migrations folder
- [ x ] Create a migration runner script
- [ x ] Add a migrations tracking table
- [ x ] Verify migrations can be run repeatedly without dropping data
- [ x ] Document the local migration workflow

### Exit criteria
- [ x ] Schema changes can be applied safely
- [ x ] Existing development flow no longer depends on dropping/recreating tables

---

## 2. Create the Auth Schema
### Users
- [ x ] Add `users` table
- [ x ] Add `id`
- [ x ] Add `email`
- [ x ] Add unique constraint on `email`
- [ x ] Add `password_hash`
- [ x ] Add `created_at`
- [ x ] Add `updated_at` if you want it now

### Sessions
- [ x ] Add `sessions` table
- [ x ] Add `id`
- [ x ] Add `user_id`
- [ x ] Add session token storage field
- [ x ] Add `expires_at`
- [ x ] Add `created_at`
- [ x ] Add indexes for session lookup and cleanup

### Notes ownership
- [ x ] Add `user_id` to `notes`
- [ x ] Add foreign key from `notes.user_id` to `users.id`
- [ x ] Add indexes that support per-user note queries

### Data/backfill decision
- [ x ] Decide what to do with existing local notes during the migration
- [x  ] Either backfill them to a test user or accept resetting local dev data once

### Exit criteria
- [ x ] DB schema supports users, sessions, and note ownership

---

## 3. Build Password Utilities First
- [ ] Create a dedicated password module
- [ ] Add `hashPassword(...)` using `argon2`
- [ ] Add `verifyPassword(...)`
- [ ] Add password-related config/constants if needed
- [ ] Make sure plaintext passwords are never logged or stored
- [ ] Note any password length constraints/validation rules

### Exit criteria
- [ ] Password hashing/verification is centralized in one place

---

## 4. Build Session Primitives
- [ ] Create secure random session token generation
- [ ] Decide whether to store raw session tokens or hashed session tokens
- [ ] Create a session creation helper
- [ ] Create a session lookup helper
- [ ] Create a session invalidation helper
- [ ] Create expired-session handling/cleanup logic
- [ ] Create cookie serialize/set/clear helpers

### Cookie requirements
- [ ] `HttpOnly`
- [ ] `SameSite`
- [ ] `Path=/`
- [ ] `Secure` in production
- [ ] expiration behavior defined clearly

### Exit criteria
- [ ] You can create, read, and invalidate sessions cleanly

---

## 5. Add Current-User / Auth Context Helpers
- [ ] Add helper to read session from incoming request cookies
- [ ] Add helper to resolve current user from session
- [ ] Add helper for optional authenticated user
- [ ] Add helper for required authenticated user
- [ ] Decide whether auth context is passed explicitly or attached during request flow

### Exit criteria
- [ ] Any route can reliably determine whether a user is logged in

---

## 6. Add Auth Validation
- [ ] Create auth validation module
- [ ] Validate email input
- [ ] Normalize email consistently
- [ ] Validate password length
- [ ] Validate password confirmation for signup
- [ ] Keep structured validation result pattern
- [ ] Keep auth error messages safe and non-leaky

### Exit criteria
- [ ] Signup/login inputs are validated consistently before auth logic runs

---

## 7. Implement Signup
- [ ] Add signup GET route
- [ ] Add signup view
- [ ] Add signup POST route
- [ ] Validate form input
- [ ] Check for duplicate email
- [ ] Hash password with `argon2`
- [ ] Insert user record
- [ ] Create session immediately after successful signup
- [ ] Set session cookie
- [ ] Redirect safely after signup
- [ ] Preserve non-sensitive form values on validation failure
- [ ] Never re-render password values into the form

### Exit criteria
- [ ] New user can register and ends up logged in

---

## 8. Implement Login
- [ ] Add login GET route
- [ ] Add login view
- [ ] Add login POST route
- [ ] Validate input
- [ ] Look up user by normalized email
- [ ] Verify password with `argon2`
- [ ] Return generic invalid-credentials errors
- [ ] Create session on success
- [ ] Set session cookie
- [ ] Redirect safely after login

### Exit criteria
- [ ] Existing user can log in securely

---

## 9. Implement Logout
- [ ] Add logout route
- [ ] Make logout a `POST`
- [ ] Invalidate session server-side
- [ ] Clear the session cookie
- [ ] Redirect safely after logout

### Exit criteria
- [ ] User can log out and session is actually invalidated

---

## 10. Make Notes User-Owned
- [ ] Update note creation flow to require authenticated user
- [ ] Attach `user_id` when creating a note
- [ ] Update note list queries to filter by current user
- [ ] Update note detail queries to filter by current user
- [ ] Update note edit/update queries to filter by current user
- [ ] Update note delete queries to filter by current user

### Exit criteria
- [ ] Notes are fully scoped to the authenticated owner

---

## 11. Add Route Protection / Authorization
- [ ] Decide which routes remain public
- [ ] Decide which routes require authentication
- [ ] Redirect or block unauthenticated access consistently
- [ ] Add typed app errors for authorization failures where useful
- [ ] Decide whether unauthorized ownership access returns `404` or `403`
- [ ] Apply that strategy consistently

### Likely public routes
- [ ] home
- [ ] signup
- [ ] login
- [ ] styles/static assets

### Likely protected routes
- [ ] notes list
- [ ] new note form
- [ ] create note
- [ ] note detail
- [ ] edit note
- [ ] update note
- [ ] delete note
- [ ] logout

### Exit criteria
- [ ] Logged-out users cannot access protected note actions
- [ ] Logged-in users cannot access other users’ notes

---

## 12. Add CSRF Protection
- [ ] Choose CSRF strategy for server-rendered forms
- [ ] Create CSRF token generation helper
- [ ] Create CSRF token verification helper
- [ ] Render CSRF token in every state-changing form
- [ ] Verify CSRF token on every state-changing POST route

### Protect these routes
- [ ] signup POST
- [ ] login POST
- [ ] logout POST
- [ ] create note POST
- [ ] update note POST
- [ ] delete note POST

### Exit criteria
- [ ] Missing/invalid CSRF tokens are rejected safely
- [ ] Valid tokens allow normal form submission

---

## 13. Update Layout / Views for Auth Awareness
- [ ] Update layout/header to reflect logged-in vs logged-out state
- [ ] Show signup/login links when logged out
- [ ] Show logout and maybe current user email when logged in
- [ ] Add CSRF hidden inputs to forms
- [ ] Keep forms accessible and server-rendered
- [ ] Keep escaping rules consistent

### Exit criteria
- [ ] The UI clearly reflects auth state and all forms still work without JS

---

## 14. Verify Cookie and Security Behavior
- [ ] Confirm auth cookies are `HttpOnly`
- [ ] Confirm `SameSite` is set intentionally
- [ ] Confirm `Secure` is enabled in production
- [ ] Confirm session expiration works as expected
- [ ] Confirm expired sessions are rejected
- [ ] Confirm security headers still make sense with auth flows

### Exit criteria
- [ ] Session and cookie behavior matches secure expectations

---

## 15. Manual Test Pass
### Signup/login/logout
- [ ] signup success
- [ ] signup duplicate email failure
- [ ] signup validation failure
- [ ] login success
- [ ] login invalid credentials
- [ ] logout success

### Sessions
- [ ] cookie is set after signup/login
- [ ] cookie is cleared on logout
- [ ] expired session is rejected
- [ ] invalid/tampered session is rejected

### Authorization
- [ ] logged-out user cannot access protected routes
- [ ] user A cannot read user B’s note
- [ ] user A cannot edit user B’s note
- [ ] user A cannot delete user B’s note
- [ ] new notes are owned by the correct user

### CSRF
- [ ] missing token is rejected
- [ ] invalid token is rejected
- [ ] valid token succeeds
- [ ] logout is CSRF-protected

### HEAD / routing sanity
- [ ] safe GET routes still support `HEAD`
- [ ] auth changes did not break existing request handling patterns

### Exit criteria
- [ ] Core auth/security flows work end-to-end

---

## 16. Refactor Only If Phase 3 Justifies It
- [ ] Re-evaluate whether `server.ts` is now too large
- [ ] Extract auth route handlers if the code is getting noisy
- [ ] Extract note route handlers if Phase 3 made that worthwhile
- [ ] Keep abstractions proportional to real complexity
- [ ] Avoid splitting files just because it “feels cleaner”

### Exit criteria
- [ ] Structure remains understandable and frameworkless

---

## 17. Phase 3 Done When
- [ ] Users can sign up securely
- [ ] Users can log in securely
- [ ] Users can log out securely
- [ ] Sessions are stored and validated securely
- [ ] CSRF protection is enforced on state-changing routes
- [ ] Notes are owned by users
- [ ] Users can only access their own notes
- [ ] The app still works without client-side JavaScript
- [ ] The codebase remains understandable

---

## Optional Stretch After Core Phase 3
- [ ] basic login rate limiting
- [ ] remember-me session option
- [ ] password change flow
- [ ] session cleanup job
- [ ] session revocation UI
- [ ] email verification
- [ ] password reset flow