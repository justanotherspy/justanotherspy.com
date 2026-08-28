# CLAUDE

Astro + bun static site. See `@README.md` for the project tour, structure, and content schemas. Read it before working here.

## Tooling

- **Use `bun`, never `npm`/`yarn`/`pnpm`.** All scripts: `bun run dev | build | preview`, `bun astro check`.
- `@astrojs/check` + `typescript` are dev deps and `astro.config.mjs` requires `integrations: []`.
- The `astro-docs` MCP server is the source of truth for Astro APIs. Prefer it over training data, especially for content collections (`src/content.config.ts`, `glob()` loader, `render(entry)` returns `{ Content }`, entry id is the slug).
- Use Context7 MCP for any other library docs.

## Design source of truth

`design/Prototype v4.html` is the base visual identity. The outer `.page` frame, the `#E0DCD5` body, the doc-head/tabs/resp-note are **prototype harness only** and don't ship. The live site has since evolved past the prototype (notes pages removed; plugin-ecosystem, tap, and talks sections added; fluid type), so where the two disagree, the shipped `src/` is the reference. Never copy harness rules into the live styles.

`design/justanotherspy-identity-v05.html` is an older identity doc; treat it as input only.

## Patterns to keep

- Component class names match the prototype 1:1 where a prototype counterpart exists (`.proj-card`, `.archive-row`, `.pd-grid`, `.prose`, `.code`, `.site-nav`, …). New components follow the same naming style.
- All design tokens are CSS variables in `src/styles/global.css`. Don't hardcode colors or sizes in component files; read from tokens.
- Theming flips on `body[data-theme]`. Every component that needs different dark-mode treatment ships both rules in `global.css`. Don't introduce a separate dark stylesheet or `prefers-color-scheme` media queries in components.
- The lowercase-headings rule is intentional and applies only to display heading classes. Don't lowercase body copy, captions, stack values, or proper nouns.
- Project markdown can contain raw HTML for the install code block + screenshot (see `src/content/projects/garlic.md`). This preserves the prose/code interleaving without bespoke per-page templates. Keep this pattern instead of adding template slots.
- **No em or en dashes anywhere in this repo**: not in prose, comments, UI strings, or metadata. Use a comma, colon, period, or parentheses instead.
- Site copy must stay accurate against the tool repos (garlic, shuck, claude-plugins, homebrew-tap, talks). When a tool's surface changes, the project page changes in the same spirit; don't let the site describe removed features.

## Working with the user

- Daniel writes the long-form copy himself. When seeding content, prefer minimal frontmatter-only stubs over invented prose, unless he asks for a rewrite.
- Daniel verifies UI / interactions in the browser himself. Run `bun astro check`, `bun run build`, start the dev server backgrounded, and report the URL + routes for him to check.
- Ask before adding dependencies, and when the design / scope is ambiguous.

## Gotchas

- `astro.config.mjs` requires `integrations: []`; leaving it `{}` errors with `integrations: Required`.
- `entry.id` is the slug (filename without `.md`). There is no `entry.slug`.
- The build-time `glob()` loader lives in `astro/loaders`, not `astro:content`.
