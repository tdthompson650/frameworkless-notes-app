# Frameworkless Notes App — Finish Line Checklist

## Must-do before calling it complete

### Security hardening
- [ x ] Add basic login rate limiting / throttling
- [ x ] Add basic signup rate limiting / throttling
- [ x ] Reduce login timing differences for unknown-email vs known-email cases
- [ x ] Delete orphaned sessions when `getAuthContext()` finds a session but no user
- [ x ] Change `readFormBody()` to accumulate `Buffer`s and decode once at the end
- [ x ] Verify every state-changing POST route still checks CSRF after the latest changes
- [ x ] Verify cookies behave correctly in production (`Secure` on HTTPS)

### Accessibility / responsiveness
- [ ] Add clear visible focus styles for links, buttons, inputs, and textarea
- [ ] Check keyboard-only flow for signup, login, note create, note delete, logout
- [ ] Check labels/errors read clearly and make sense in order
- [ ] Test responsive layout at narrow mobile width
- [ ] Make sure long signed-in email text does not break nav layout badly
- [ ] Verify pages do not require horizontal scrolling in normal use

### Final quality pass
- [ ] Run `npx tsc --noEmit`
- [ ] Run the app manually and retest all critical flows
- [ ] Remove dead code / outdated comments / outdated checklist items
- [ ] Make sure naming is consistent (`userId`, `csrfToken`, etc.)
- [ ] Make sure there are no TODOs that imply unfinished security work

### README / portfolio polish
- [ ] Add a short project overview
- [ ] List stack and why it is frameworkless
- [ ] List the security measures implemented
- [ ] Mention accessibility and responsive goals
- [ ] Add setup instructions (`.env`, migrate, dev, build, start)
- [ ] Add a short “What I would improve next” section
- [ ] Add screenshots or a short demo GIF/video

---

## Recommended manual test checklist

### Auth
- [ ] Sign up with valid credentials
- [ ] Reject duplicate email signup
- [ ] Reject invalid signup input
- [ ] Log in with valid credentials
- [ ] Reject invalid login credentials
- [ ] Log out successfully
- [ ] Protected routes redirect when logged out
- [ ] Logged-in users are redirected away from `/signup` and `/login`

### Authorization
- [ ] User only sees their own notes
- [ ] User cannot open another user’s guessed note URL
- [ ] User cannot delete another user’s note

### CSRF
- [ ] Signup fails when pre-auth CSRF token is missing/invalid
- [ ] Login fails when pre-auth CSRF token is missing/invalid
- [ ] Logout fails when CSRF token is missing/invalid
- [ ] Note creation fails when CSRF token is missing/invalid
- [ ] Note delete flows fail when CSRF token is missing/invalid

### Headers / cookies
- [ ] Session cookie is `HttpOnly`
- [ ] Session cookie is `SameSite`
- [ ] Session cookie is `Secure` in production
- [ ] CSP header is present on HTML responses
- [ ] `X-Content-Type-Options: nosniff` is present
- [ ] `Referrer-Policy: no-referrer` is present

---

## Explicitly out of scope
- [ ] Password reset
- [ ] Email verification
- [ ] Remember me
- [ ] Profile/settings pages
- [ ] Rich text editing
- [ ] Large refactor unless needed for safety/clarity
- [ ] Big automated test suite

---

## Done when
- [ ] Core security issues above are addressed
- [ ] Responsive/accessibility pass is complete
- [ ] README is portfolio-ready
- [ ] Manual test checklist passes
- [ ] No major known issues remain