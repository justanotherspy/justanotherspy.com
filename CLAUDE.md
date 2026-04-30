# CLAUDE

Astro 6 + bun static site. See `@README.md` for the project tour, structure, and content schemas — read it before working here.

## Tooling

- **Use `bun`, never `npm`/`yarn`/`pnpm`.** All scripts: `bun run dev | build | preview`, `bun astro check`.
- `@astrojs/check` + `typescript` are dev deps and `astro.config.mjs` requires `integrations: []` (Astro 6 schema).
- The `astro-docs` MCP server is the source of truth for Astro APIs — prefer it over training data, especially for content collections (the v6 API changed: `src/content.config.ts`, `glob()` loader, `render(entry)` returns `{ Content }`, entry id is the slug).
- Use Context7 MCP for any other library docs.

## Design source of truth

`design/Prototype v4.html` is the approved visual identity. The outer `.page` frame, the `#E0DCD5` body, the doc-head/tabs/resp-note are **prototype harness only** — they don't ship. Inside the page chrome, recreate pixel-perfectly. Never copy harness rules into the live styles.

`design/justanotherspy-identity-v05.html` is an older identity doc; treat it as input only — the prototype supersedes it where they disagree.

## Patterns to keep

- Component class names match the prototype 1:1 (`.proj-card`, `.archive-row`, `.pd-grid`, `.prose`, `.code`, `.site-nav`, …) so visual diffs against the prototype are direct. When you add a new component, port the prototype's class name; don't invent.
- All design tokens are CSS variables in `src/styles/global.css`. Don't hardcode colors or sizes in component files — read from tokens.
- Theming flips on `body[data-theme]`. Every component that needs different dark-mode treatment ships both rules in `global.css`. Don't introduce a separate dark stylesheet or `prefers-color-scheme` media queries in components.
- The lowercase-headings rule is intentional and applies only to display heading classes — don't lowercase body copy, captions, stack values, or proper nouns.
- Project markdown can contain raw HTML for the install code block + screenshot (see `src/content/projects/garlic.md`). This preserves the prototype's prose/code/screenshot interleaving without bespoke per-page templates. Keep this pattern instead of adding template slots.

## Working with the user

- Daniel writes the long-form copy himself. When seeding content, prefer minimal frontmatter-only stubs over invented prose, except where the prototype already specifies copy verbatim.
- Daniel verifies UI / interactions in the browser himself. Don't claim visual verification — run `bun astro check`, `bun run build`, start the dev server backgrounded, and report the URL + routes for him to check.
- Ask before adding dependencies, and when the design / scope is ambiguous. The prototype + identity docs are detailed; clarify rather than guess.

## Gotchas

- Astro 6 requires `integrations: []` in `astro.config.mjs` — leaving it `{}` errors with `integrations: Required`.
- `getEntry(reference)` accepts the result of `reference()` directly — no `{ collection, id }` rebuild needed.
- `entry.id` is the slug (filename without `.md`). There is no `entry.slug` in v6.
- The build-time `glob()` loader lives in `astro/loaders`, not `astro:content`.
