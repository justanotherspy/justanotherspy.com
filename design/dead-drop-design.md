# Dead Drop — page & UX design

The dead drop is an anonymous, write-only tip line. Anyone can leave a short message;
it is forwarded to a private Slack channel and never shown publicly. This document
specifies the **page**. The backend contract lives in `dead-drop-api.md`.

## Concept

- A quiet, low-ceremony place to leave a message. The spy framing is implicit, not
  played up — same dry, unhurried voice as the rest of the site.
- **Anonymous by default.** Sending tells us nothing about the sender unless they choose
  to add a name.
- **Write-only.** The page never reflects submitted content back into the DOM. There is
  no preview, no list of past messages, no echo on success — only a confirmation popup.

## Placement

- Route: `/dead-drop` (`src/pages/dead-drop.astro`).
- Linked from the top nav alongside home / projects / notes, label **"dead drop"**.
  `active="deaddrop"` highlights it; the value is part of the `active` union in both
  `SiteNav.astro` and `BaseLayout.astro`.

## Layout

Inside the standard `.content` container:

1. `h1.page-title` — "dead drop" (lowercased by the display-heading rule).
2. `.lede` — one sentence: anonymous by default, nothing is collected, nothing is shown back.
3. `form.dd-form` (max-width 640px), fields top to bottom:
   - **message** — `<textarea.dd-textarea>`, required, `maxlength` 2000, plain text. A live
     `.dd-count` shows `used / 2000`.
   - **stay anonymous** — `<input type="checkbox" checked>` in `.dd-check-row`, default on.
   - **name or alias** — optional `<input.dd-input>` (`maxlength` 80) inside a `.dd-field`
     that is `.is-hidden` until "stay anonymous" is unchecked. Re-checking clears it.
   - **honeypot** — an off-screen `.dd-hp` text input (`name="company"`, `tabindex=-1`,
     `aria-hidden`). Humans never see it; a filled value marks the submission as a bot.
   - **actions** — `.btn-primary` ("drop it") + a `.dd-error` status line (hidden until needed).
4. `<dialog.dd-modal data-modal>` — the "message dropped" confirmation, opened on success.

## Behavior (client)

Vanilla bundled `<script>` in the page (same approach as `ThemeToggle.astro`):

- Endpoint comes from `form.dataset.endpoint`, set in frontmatter from
  `import.meta.env.PUBLIC_DEADDROP_ENDPOINT` (placeholder fallback). No secrets client-side.
- Live char counter; alias field shown/hidden from the anonymous checkbox.
- On submit (`preventDefault`):
  - If the honeypot is filled → silently show the success popup, send nothing.
  - Trim the message; empty → inline `.dd-error` ("write something first") and focus, no request.
  - POST JSON `{ message, anonymous, alias? }` (`alias` only when not anonymous and non-empty).
  - Disable the button + `aria-busy` while in flight.
  - **Success** (`res.ok`) → reset the form, reset counter/alias, `dialog.showModal()`.
  - **429** → "too many messages right now"; other errors → generic retry text. Re-enable button.
- **No reflection:** the message is never written back into the page; all error/success copy
  is static.

## Visual / tokens

All new styles are appended to `src/styles/global.css` under a `.dd-*` namespace (no
prototype form class exists to mirror) and use only existing tokens — 8px-multiple spacing,
0.5px borders, terracotta accent for labels and the focus ring. Every component ships a
`body[data-theme="dark"]` rule.

- Labels: `.dd-label` mirrors `.label` (mono, uppercase, accent).
- Inputs/textarea: warm `#FBFAF8` (light) / `#2A2724` (dark) surface, focus = accent border
  + soft accent glow.
- Dialog: card styling matching `.proj-card` (accent top border, surface background, dimmed
  `::backdrop`); native `<dialog>` gives focus trap + ESC for free.

## Accessibility

- Every field has a real `<label for>`; the error line is `role="alert"`.
- Native `<dialog>` traps focus and closes on ESC; the close button returns focus to the page.
- The honeypot is `aria-hidden` + `tabindex=-1` so assistive tech and keyboard users skip it.

## Anti-abuse (page side)

- Honeypot field + `maxlength` caps are the only client measures. Real protection (heavy
  rate limiting, sanitization) is server-side — see `dead-drop-api.md`. The client never
  trusts itself to be the gate.
