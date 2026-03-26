# Frameworkless Notes App — Phase 1 Checklist

## Phase 1 Goal

Build a working server-rendered notes app using Node.js, TypeScript, and PostgreSQL, without frameworks, while keeping the code understandable and ready to improve later.

---

## Success Criteria

By the end of Phase 1, the app should:

- run on a raw Node HTTP server
- render HTML on the server
- connect to PostgreSQL
- allow creating, listing, viewing, and deleting notes
- use POST/Redirect/GET for form submissions
- use parameterized queries only
- escape all user-generated content before rendering
- use semantic HTML
- be usable on mobile and desktop
- remain understandable without over-abstraction

---

## Core Implementation Checklist

### 1. Project Setup
- [ x ] Initialize Node.js + TypeScript project
- [ x ] Configure TypeScript
- [ x ] Add minimal dependencies only:
  - [ x ] `pg`
  - [ x ] `dotenv`
- [ x ] Add scripts for development/build/run
- [ x ] Create environment variable setup for database connection

### 2. HTTP Server
- [ x ] Create raw Node HTTP server using built-in `http`
- [ x ] Confirm server can respond to a basic request
- [ x ] Understand request and response objects before abstracting anything

### 3. Basic Router
- [ x ] Create a simple router based on method + pathname
- [ x ] Support at least:
  - [ x ] `GET`
  - [ x ] `POST`
- [ x ] Route requests to handler functions
- [ x ] Keep routing logic readable and explicit

### 4. Response Helpers
- [ x ] Create helper for HTML responses
- [ x ] Create helper for redirects
- [ x ] Create helper for plain 404 response
- [ x ] Create helper for basic 500 response

### 5. Request Parsing
- [ x ] Parse URL and pathname
- [ x ] Parse route params for note IDs
- [ x ] Reject malformed note IDs safely
- [ x ] Parse form body for `application/x-www-form-urlencoded`
- [ x ] Reject or safely handle unsupported body shapes
- [ x ] Add request body size limit
- [ x ] Parse and validate Content-Type for form submissions
- [ x ] Normalize parsed form fields to guaranteed strings before use

### 6. HTML Rendering
- [ x ] Render pages with server-side string templates
- [ x ] Create a shared layout wrapper
- [ x ] Include page title support
- [ x ] Keep templates simple and readable

### 7. Database Setup
- [ x ] Connect to PostgreSQL
- [ x ] Create initial notes table
- [ x ] Verify basic query execution works
- [ x ] Keep DB logic separate enough to refactor later

### 8. Notes Features
- [ x ] Home page
- [ x ] Notes list page
- [ x ] New note form page
- [ x ] Create note handler
- [ x ] Single note page
- [ ] Delete note handler

### 9. Routes to Support
- [ X ] `GET /`
- [ X ] `GET /notes`
- [ X ] `GET /notes/new`
- [ X ] `POST /notes`
- [ X ] `GET /notes/:id`
- [ X ] `POST /notes/:id/delete`

### 10. Validation
- [ x ] Validate note title
- [ x ] Validate note content/body
- [ x ] Reject missing or invalid data safely
- [ x ] Return helpful but simple user-facing errors
- [ x ] Define separate constants for transport limits vs application field limits

### 11. Escaping and Safety
- [ x ] Escape all user-generated content before rendering
- [ x ] Use parameterized SQL queries only
- [ x ] Never concatenate user input into SQL
- [ x ] Do not allow state-changing GET routes

### 12. UI and Accessibility
- [ x ] Use semantic HTML structure
- [ x ] Use proper headings
- [ x ] Use `<label>` for form inputs
- [ x ] Use real `<button>` elements
- [ x ] Make forms usable without JavaScript
- [ x ] Ensure keyboard navigation works
- [ x ] Include visible error messaging if validation fails
- [ x ] Add a confirmation step or confirmation UI for destructive actions

### 13. Responsive Basics
- [ x ] Add a mobile-friendly layout
- [ x ] Keep line lengths readable
- [ x ] Ensure forms work on smaller screens
- [ x ] Use simple CSS only
- [ x ] Focus on clarity, not polish

### 14. Error Handling
- [ x ] Handle unknown routes with 404
- [ x ] Handle unexpected server errors with 500
- [ x ] Avoid leaking stack traces or DB details to users
- [ x ] Log enough information for debugging during development
- [ x ] Wrap async request handling in try/catch and return a safe 500

---

## Recommended File/Responsibility Targets

These do not need to be perfect yet, but the code should begin moving toward separation of concerns.

- [ ] server entry file
- [ ] router logic
- [ ] request parsing helpers
- [ ] response helpers
- [ ] HTML/template helpers
- [ ] DB access layer or DB helper file
- [ ] note handlers or note-related functions
- [ ] CSS file

---

## Manual Testing Checklist

### Routing and Pages
- [ ] Home page loads
- [ ] Notes list page loads
- [ ] New note form page loads
- [ ] Single note page loads for valid ID
- [ ] Invalid route returns 404

### Notes Flow
- [ ] Can create a valid note
- [ ] After create, app redirects instead of resubmitting form
- [ ] Created note appears in notes list
- [ ] Can open single note page
- [ ] Can delete note
- [ ] Deleted note no longer appears

### Validation and Safety
- [ ] Empty form submission is handled safely
- [ ] Very long input is handled safely
- [ ] HTML/script-like input is escaped in output
- [ ] SQL injection attempts do not work

### Accessibility and Responsiveness
- [ ] Can navigate forms with keyboard only
- [ ] Labels are associated with inputs
- [ ] Buttons are clearly identifiable
- [ ] Pages remain usable on narrow/mobile-sized screen

---

## Phase 1 Non-Goals

Do not spend Phase 1 time on:

- auth
- sessions
- CSRF protection
- advanced abstractions
- fancy UI
- frontend JavaScript enhancements
- API design
- rate limiting
- perfect architecture

Those come later.

---

## Phase 1 Standard

Phase 1 is complete when the app is:

- working
- understandable
- server-rendered
- database-backed
- reasonably safe in its basic patterns
- ready to clean up in Phase 2