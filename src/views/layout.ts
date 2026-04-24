import { escapeHtml } from '../utils/escape.js';

export type RenderPageOptions = {
	currentUserEmail?: string | null;
	logoutCsrfToken?: string | null;
};

/** Avoids assigning `undefined` to optional props under exactOptionalPropertyTypes. */
export function buildRenderPageOptions(
	currentUserEmail?: string | null,
	logoutCsrfToken?: string | null
): RenderPageOptions {
	const options: RenderPageOptions = {};

	if (currentUserEmail !== undefined) {
		options.currentUserEmail = currentUserEmail;
	}

	if (logoutCsrfToken !== undefined) {
		options.logoutCsrfToken = logoutCsrfToken;
	}

	return options;
}

function renderNavigation(
	currentUserEmail?: string | null,
	logoutCsrfToken?: string | null
): string {
	if (currentUserEmail) {
		return `
      <div class="nav-primary">
        <a href="/">Home</a>
        <a href="/notes">Notes</a>
        <a href="/notes/new">New note</a>
      </div>
      <div class="nav-user-cluster">
        <span class="nav-user">Signed in as ${escapeHtml(currentUserEmail)}</span>
        <form method="post" action="/logout" class="inline-form">
          <input
            type="hidden"
            name="csrfToken"
            value="${escapeHtml(logoutCsrfToken ?? '')}"
          >
          <button type="submit">Log out</button>
        </form>
      </div>
    `;
	}

	return `
    <div class="nav-primary">
      <a href="/">Home</a>
      <a href="/signup">Sign up</a>
      <a href="/login">Log in</a>
    </div>
  `;
}

// `title` is escaped here.
// `content` must be trusted HTML that was built safely by the caller.
// Escape any user-controlled values before interpolating them into `content`.
export function renderPage(
	title: string,
	content: string,
	options: RenderPageOptions = {}
): string {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/styles.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>

    <header>
      <nav aria-label="Main navigation">
        ${renderNavigation(options.currentUserEmail, options.logoutCsrfToken)}
      </nav>
    </header>

    <main id="main-content" tabindex="-1">
      ${content}
    </main>
  </body>
</html>`;
}