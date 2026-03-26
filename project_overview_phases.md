# Frameworkless Notes App — Updated Phase Breakdown

## Project Goal

Build a full-stack notes application without frameworks to deeply understand core web development concepts, especially:

- HTTP fundamentals
- Server-side rendering
- Routing and request handling
- PostgreSQL integration
- Authentication and sessions
- Web security principles
- Accessibility
- Responsive design

The app should begin as a learning sandbox and gradually become a portfolio-quality project.

---

## Project-Wide Rules

- Do not introduce frameworks
- Prefer simple, understandable implementations
- Security decisions must be explained, not silently added
- Accessibility must be considered in UI decisions
- Use parameterized queries only
- Escape all user-generated content before rendering
- Keep code modular enough to refactor later
- The app must work without client-side JavaScript
- Any later JavaScript must be progressive enhancement only

---

## Phase 1 — Foundations

### Goal
Build a working server-rendered notes app with core HTTP, routing, rendering, and database flow in place.

### Focus Areas
- Raw Node.js HTTP server
- Basic router
- Request/response lifecycle understanding
- Server-side HTML rendering with string templates
- PostgreSQL connectivity
- Notes CRUD basics
- POST/Redirect/GET pattern
- Semantic HTML
- Minimal mobile-friendly styling

### Deliverables
- `GET /`
- `GET /notes`
- `GET /notes/new`
- `POST /notes`
- `GET /notes/:id`
- `POST /notes/:id/delete`
- Notes stored in PostgreSQL
- Basic validation for note input
- Escaped user content in rendered HTML
- Simple reusable layout wrapper
- Basic CSS for readable responsive pages

### Phase 1 Mindset
- Okay to be a little messy
- Not okay to be confusing or chaotic
- Prioritize understanding every line
- Avoid premature abstraction

---

## Phase 2 — Structure and Security Baseline

### Goal
Refactor the Phase 1 code into a cleaner shape and establish strong baseline protections.

### Focus Areas
- Separate modules/files by responsibility
- Improve router design
- Centralize response helpers
- Centralize request parsing helpers
- Input validation improvements
- Output escaping helpers
- Security headers
- Request body size limits
- Better error handling patterns

### Deliverables
- Cleaner file structure
- Reusable helpers for:
  - HTML responses
  - redirects
  - errors
  - parsing form data
  - escaping output
- Security headers added
- Validation rules for note fields
- Safe error responses for users
- Internal logging for debugging

### Security Outcomes
- Stronger XSS protection habits
- Safer defaults
- Better control over request handling
- Cleaner base for auth work

---

## Phase 3 — Authentication and Real Application Security

### Goal
Turn the app into a real multi-user system with secure authentication, sessions, and authorization.

### Focus Areas
- User registration
- User login/logout
- Password hashing with `argon2`
- Cookie-based sessions
- CSRF protection
- Authorization checks
- Per-user note ownership
- Safer auth error handling

### Deliverables
- `users` table
- `sessions` table
- Signup form
- Login form
- Logout flow
- Session cookie creation and invalidation
- Notes owned by authenticated users
- Users can only access their own notes
- CSRF protection for state-changing requests

### Why This Phase Matters
This is the phase that makes the project especially strong for a portfolio because it demonstrates:
- authentication
- authorization
- session handling
- practical web security

---

## Phase 4 — Hardening and Portfolio Polish

### Goal
Refine the project into a professional, explainable, portfolio-grade application.

### Focus Areas
- Accessibility review and improvements
- Responsive refinement
- Logging improvements
- Rate limiting
- UX cleanup
- Documentation
- Architecture explanation
- Deployment readiness

### Deliverables
- Accessibility pass with semantic and keyboard improvements
- Better responsive layout on phone/tablet/desktop
- Rate limiting for sensitive routes
- Cleaner user-facing errors
- README with:
  - project purpose
  - architecture overview
  - security decisions
  - setup instructions
  - learning outcomes
- Deployment checklist
- Optional critical-path tests

### Portfolio Outcome
By the end of this phase, the project should clearly show:
- first-principles web development knowledge
- backend fundamentals
- secure coding practices
- accessibility awareness
- ability to explain architecture and tradeoffs

---

## What Stays Out of Scope Early

To protect the learning goals, avoid these in early phases:

- Frontend frameworks
- SPA patterns
- rich client-side interactions
- OAuth/social login
- realtime collaboration
- advanced editor features
- unnecessary libraries that hide fundamentals

---

## Guiding Standard for the Whole Project

The app should be:

- fully usable without JavaScript
- secure by default
- accessible by design
- mobile-friendly from the start
- easy to understand and explain
- simple enough to refactor as knowledge improves