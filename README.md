# justanotherspy.com

Personal portfolio site. Built with [Astro](https://astro.build) on bun.

## Stack

- **Astro** (static output, file-based routing, content collections)
- **bun** as the package manager and runtime
- **DM Serif Display** for display / heading type, **IBM Plex Mono** for labels and code, system sans for body copy. Both faces are self-hosted from `public/fonts/`
- No CSS framework, no JS framework: one global stylesheet, plain `.astro` components, a small inline theme-bootstrap script

## Structure

```text
.
├── design/
│   ├── README.md                 # where the design system lives (a Claude Design artifact)
│   ├── dead-drop-design.md       # dead drop page / UX spec
│   └── dead-drop-api.md          # dead drop API contract (vendor-neutral)
├── public/                       # static assets served at site root
│   ├── fonts/*.woff2             # DM Serif Display + IBM Plex Mono (OFL)
│   ├── favicon.svg, *.png, .ico  # the "js" mark
│   ├── clawds-fable/index.html   # Clawd's Fable, the build day game (self-contained HTML)
│   └── talks/*.pdf               # talk slides, copied from justanotherspy/talks
└── src/
    ├── og/
    │   ├── card.ts               # build-time Open Graph card renderer (satori + resvg)
    │   └── fonts/                # DM Serif Display + IBM Plex Mono TTFs (OFL) for the cards
    ├── content.config.ts         # Zod-typed `projects` and `writing` collections
    ├── content/
    │   ├── projects/*.md         # project entries (frontmatter + body)
    │   └── writing/*.md          # posts (frontmatter + body)
    ├── lib/
    │   ├── latest-release.ts     # build-time GitHub latest-release lookup
    │   └── post-date.ts          # date label for writing rows and post pages
    ├── styles/
    │   └── global.css            # all design tokens + component classes
    ├── layouts/
    │   └── BaseLayout.astro      # html/head, fonts, theme bootstrap, nav, footer
    ├── components/
    │   ├── SiteNav.astro         # top nav with active-link prop
    │   ├── SiteFooter.astro
    │   ├── ThemeToggle.astro     # the small dot button in the nav
    │   ├── ProjectCard.astro     # default / featured / compact variants
    │   ├── ArchiveRow.astro      # date · title · meta row (writing, talks)
    │   ├── Terminal.astro            # terminal window with one typed command
    │   └── MetaCard.astro        # the sidebar key/value card on project pages
    └── pages/
        ├── index.astro           # home: hero, projects, plugin ecosystem, tap, talks
        ├── projects/index.astro  # all projects + work-in-progress list
        ├── projects/[slug].astro # project detail (case study + sticky sidebar)
        ├── writing/index.astro   # all posts, newest first
        ├── writing/[slug].astro  # one post
        ├── dead-drop.astro       # anonymous message form (client POST to external API)
        ├── 404.astro             # not-found page (GitHub Pages serves 404.html)
        ├── og/[card].png.ts      # one 1200x630 social preview PNG per page
        └── sitemap.xml.ts        # hand-rolled sitemap endpoint (no integration dep)
```

## Routes

| Route              | Source                                                    |
| ------------------ | --------------------------------------------------------- |
| `/`                | `src/pages/index.astro`                                   |
| `/projects`        | `src/pages/projects/index.astro`                          |
| `/projects/<slug>` | `src/pages/projects/[slug].astro` ← `projects` collection |
| `/writing`         | `src/pages/writing/index.astro`                           |
| `/writing/<slug>`  | `src/pages/writing/[slug].astro` ← `writing` collection   |
| `/dead-drop`       | `src/pages/dead-drop.astro`                               |
| `/clawds-fable`    | `public/clawds-fable/index.html` (static, copied verbatim) |
| `/talks/<file>.pdf` | `public/talks/*.pdf` (talk slides, copied verbatim)       |
| `/og/<card>.png`   | `src/pages/og/[card].png.ts` (social preview images)      |

The `<slug>` is the markdown filename (without `.md`) for each entry.

## Home page sections

Besides the hero and the project grid (every entry in the `projects`
collection, two to a row), the home page has two prose sections kept accurate
against their source repos:

- **Getting them**: the Homebrew tap
  [justanotherspy/homebrew-tap](https://github.com/justanotherspy/homebrew-tap)
  (garlic, garnish, shuck, sproot; casks are regenerated and pushed by each
  tool's release pipeline, never hand-edited) and the Claude Code plugin
  marketplace [justanotherspy/claude-plugins](https://github.com/justanotherspy/claude-plugins)
  (garlic, shuck, sproot, output-styles).
- **Talks & build days**: a short paragraph plus a list (the `community` array
  in `index.astro`). Talk slides from
  [justanotherspy/talks](https://github.com/justanotherspy/talks) are copied
  unchanged into `public/talks/` (e.g. `public/talks/claude-code-2026-08-27.pdf`)
  so they open in the browser's own PDF viewer; when a new talk lands in the
  repo, copy its PDF over and add a row. Clawd's Fable, the game from the Claude
  Cape Town Community build day, is a single HTML file from
  [justanotherspy/claude-build-day](https://github.com/justanotherspy/claude-build-day)
  (`fable5.1/demo/clawds-fable.html`), copied unchanged into
  `public/clawds-fable/index.html` so it is served at `/clawds-fable`.

Work-in-progress projects (currently sproot and claude poker) are a small array
in `src/pages/projects/index.astro`: cards that link straight to GitHub, with no
detail page until the project has settled enough for a write-up.

## Dead drop

`/dead-drop` is an anonymous, write-only message form. The site is static, so it POSTs
client-side to an external API (built separately) whose URL is read from the
`PUBLIC_DEADDROP_ENDPOINT` env var at build time (falls back to a placeholder if unset).
Set it for production, or point it at a mock echo for local testing. Nothing the visitor
types is reflected back into the page; success is just a confirmation popup. See
`design/dead-drop-design.md` (page) and `design/dead-drop-api.md` (API contract).

## Content collections

Both collections use Astro's build-time `glob()` loader and a Zod schema
defined in `src/content.config.ts`. Frontmatter is type-checked and the resulting
types flow through `getCollection()` / `render()`.

**`projects`** frontmatter:

- `title`, `tag`, `description`, `dateLabel`
- `stack`, `version`, `licence` render in the sidebar `MetaCard`
- `github` (URL), `install` (string for the install panel)
- `order?` (number) controls sort on the home grid + projects index

**`writing`** frontmatter (posts at `/writing/<slug>`, newest first):

- `title`, `description` (the lede under the title, and the social card subtitle)
- `date` (`YYYY-MM-DD`), shown as `5 NOV 2026` on the list and the post

Each post gets its own social card (`/og/writing-<slug>.png`) and a sitemap entry.

### Project versions track the latest release

The `VERSION` shown on a project page is **not** the frontmatter value: at
build time `src/lib/latest-release.ts` asks the GitHub API for the latest
release of the repo in the entry's `github` URL (drafts and pre-releases
excluded) and renders its tag, e.g. `v0.4.2 · 2026`. The frontmatter
`version` is only the fallback when the lookup fails (offline local build,
API error). Keep it roughly current, but don't bother bumping it on every
release.

To keep the deployed site current, `ci.yml` also rebuilds on:

- `repository_dispatch` (type `release-published`), sent by the release
  workflows in `justanotherspy/garlic` and `justanotherspy/shuck` when a
  release goes live (they need a `WEBSITE_DISPATCH_TOKEN` secret with
  `contents: write` on this repo);
- a daily `schedule` cron, as a safety net if a dispatch is missed.

## Social preview images

Every page names an Open Graph card through `BaseLayout`'s `ogCard` prop
(default `home`). `src/pages/og/[card].png.ts` renders one 1200x630 PNG per
card at build time: the fixed pages (`home`, `projects`, `dead-drop`) plus
`project-<id>` for each project entry, drawn from its `tag`, `title` and
`description`. A new project gets its card automatically; a new fixed page adds
an entry to the `fixed` list there. The card colours are copied from the light
tokens because satori can't read CSS variables.

## Design system

The design system is a Claude Design artifact (see `design/README.md`). `src/styles/global.css` is its shipped copy: the tokens as CSS custom properties, then the class layer.

| Token | Light | Dark |
| ----- | ----- | ---- |
| `--bg` | `#f2f3f0` | `#121516` |
| `--surface` | `#e7e9e5` | `#1b1f21` |
| `--surface-2` | `#fafbf9` | `#20262a` |
| `--text` | `#15191b` | `#eceee9` |
| `--muted` | `#586166` | `#9aa3a6` |
| `--border` | `#d2d6d1` | `#2b3236` |
| `--accent` | `#b3262b` | `#f0625d` |
| `--on-accent` | `#ffffff` | `#190909` |

The color and shadow tokens re-scope under `[data-theme="dark"]`, so no component carries a dark rule. Spacing (`--sp-1` to `--sp-11`), radii, type sizes and shadows are tokens too.

Type rule: only display headings (`h1.display`, `h1.page-title`, `h2.section`, `h3.sub`, `.card-title`, `.archive-title`) are lowercased. Body copy, captions, stack values, and proper nouns keep natural casing. Display sizes are fluid (`clamp()`), so they scale between phone and desktop without breakpoint jumps.

Motion: blocks rise once on load, redaction bars draw across, stamps drop in, one mono line types out, and links, cards, nav links and rows have hover states. Nothing loops except the terminal caret, nothing is triggered by scroll, and all of it is off under `prefers-reduced-motion: reduce`.

Theming is handled by `data-theme="light" | "dark"` on `html` and `body`; an inline script in `BaseLayout` reads `localStorage.theme` (falling back to `prefers-color-scheme`) before paint to avoid a flash, and pins the `theme-color` metas when the user has an explicit override.

House style for all copy in this repo: no em or en dashes anywhere, in prose,
comments, or UI strings. Use a comma, colon, period, or parentheses instead.

## Commands

```sh
bun install        # install deps
bun run dev        # dev server at http://localhost:4321
bun run build      # static build to ./dist/
bun run preview    # preview the production bundle
bun astro check    # type-check Astro + collection schemas
```

## Editing content

To add a project, drop a new `.md` file into `src/content/projects/` with the
frontmatter shown above. The slug comes from the filename. Routes are generated
at build time.

Project case studies often interleave prose and code snippets. Markdown body
content can include raw HTML (`<div class="code">…</div>` for the framed code
panel, `<img>` + `<div class="img-cap">` for a captioned screenshot) at the
right insertion points; this is how `src/content/projects/garlic.md` and
`shuck.md` keep prose and code panels in step.
