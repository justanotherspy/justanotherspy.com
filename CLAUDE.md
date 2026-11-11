# CLAUDE

Astro + bun static site. See `@README.md` for the project tour, structure, and content schemas. Read it before working here.

## Tooling

- **Use `bun`, never `npm`/`yarn`/`pnpm`.** All scripts: `bun run dev | build | preview`, `bun astro check`.
- `@astrojs/check` + `typescript` are dev deps and `astro.config.mjs` requires `integrations: []`.
- The `astro-docs` MCP server is the source of truth for Astro APIs. Prefer it over training data, especially for content collections (`src/content.config.ts`, `glob()` loader, `render(entry)` returns `{ Content }`, entry id is the slug).
- Use Context7 MCP for any other library docs.

## Design source of truth

The design system is a Claude Design artifact: https://claude.ai/artifact/RbEXZgp6YzpN4SG38mPWBV (see `design/README.md`). It holds the tokens, the class layer, a guideline and preview per component, and the writing rules. Read its `project/README.md` before design work when the session can open it.

`src/styles/global.css` is the shipped copy: a token block that mirrors the artifact's `tokens.json`, then a class layer kept identical to its `components/bundle.css`. A design change lands in both in the same piece of work.

## Patterns to keep

- Component class names match the design system 1:1 (`.proj-card`, `.archive-row`, `.pd-grid`, `.prose`, `.code`, `.term`, `.stamp`, `.redact`, `.site-nav`, ...). New components follow the same naming style and get added to the design system too.
- All design tokens are CSS variables at the top of `src/styles/global.css`. Don't hardcode colors, sizes, radii or shadows in component files; read from tokens. The exceptions are places CSS variables can't reach, which copy the light values by hand: `src/og/card.ts`, the `theme-color` metas in `BaseLayout.astro` and `ThemeToggle.astro`, and `public/site.webmanifest`.
- Theming flips on `[data-theme]` (set on both `html` and `body`). The color and shadow tokens re-scope under `[data-theme="dark"]`, so components need no dark rule of their own. Don't add `body[data-theme="dark"] .thing` rules, a separate dark stylesheet, or `prefers-color-scheme` media queries in components.
- One accent, the stamp red. Text on an accent fill uses `--on-accent`, never a hardcoded white.
- Motion is short and happens once: `.rise` with `--i` for stagger, `.redact--draw`, `.stamp--in`, `.type-on`, and the built-in hover states. The direct children of `<main>` rise on their own. No scroll-triggered animation, parallax, or looping animation other than the terminal caret. All of it is off under `prefers-reduced-motion: reduce`.
- The redaction bar and the stamp are the two flourishes. One stamp per page.
- Fonts are self-hosted from `public/fonts/` (DM Serif Display, IBM Plex Mono). No font CDN.
- The lowercase-headings rule is intentional and applies only to display heading classes. Don't lowercase body copy, captions, stack values, or proper nouns.
- Project markdown can contain raw HTML for the install code block + screenshot (see `src/content/projects/garlic.md`). This preserves the prose/code interleaving without bespoke per-page templates. Keep this pattern instead of adding template slots.
- **No em or en dashes anywhere in this repo**: not in prose, comments, UI strings, or metadata. Use a comma, colon, period, or parentheses instead.
- Site copy must stay accurate against the tool repos (garlic, shuck, claude-plugins, homebrew-tap, talks). When a tool's surface changes, the project page changes in the same spirit; don't let the site describe removed features. Terminal output shown on the site (the home page `garlic statusline` line) is copied from the tool's own docs.

## Working with the user

- Daniel writes the long-form copy himself. When seeding content, prefer minimal frontmatter-only stubs over invented prose, unless he asks for a rewrite.
- Daniel verifies UI / interactions in the browser himself. Run `bun astro check`, `bun run build`, start the dev server backgrounded, and report the URL + routes for him to check.
- Ask before adding dependencies, and when the design / scope is ambiguous.

## Gotchas

- `astro.config.mjs` requires `integrations: []`; leaving it `{}` errors with `integrations: Required`.
- `entry.id` is the slug (filename without `.md`). There is no `entry.slug`.
- The build-time `glob()` loader lives in `astro/loaders`, not `astro:content`.
