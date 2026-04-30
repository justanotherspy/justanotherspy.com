# justanotherspy.com

Personal portfolio + notes site. Built with [Astro](https://astro.build) on bun.

## Stack

- **Astro 6** (static output, file-based routing, content collections)
- **bun** as the package manager and runtime
- **DM Serif Display** (Google Fonts) for display / heading type; system sans + system mono otherwise
- No CSS framework, no JS framework — one global stylesheet, plain `.astro` components, a small inline theme-bootstrap script

## Structure

```text
.
├── design/                       # source of truth for the visual design
│   ├── Prototype v4.html         # 4-page prototype (HTML/CSS) — the approved design
│   ├── justanotherspy-identity-v05.html  # earlier identity document (input only)
│   └── instructions.md           # design-handoff notes
├── public/                       # static assets served at site root
└── src/
    ├── content.config.ts         # Zod-typed `projects` + `notes` collections
    ├── content/
    │   ├── projects/*.md         # project entries (frontmatter + body)
    │   └── notes/*.md            # note entries (frontmatter + body)
    ├── styles/
    │   └── global.css            # all design tokens + component classes
    ├── layouts/
    │   └── BaseLayout.astro      # html/head, fonts, theme bootstrap, nav, footer
    ├── components/
    │   ├── SiteNav.astro         # top nav with active-link prop
    │   ├── SiteFooter.astro
    │   ├── ThemeToggle.astro     # the small dot button in the nav
    │   ├── ProjectCard.astro     # default / featured / compact variants
    │   ├── ArchiveRow.astro      # date · title · reading-time row
    │   ├── MetaCard.astro        # the sidebar key/value card on project pages
    │   ├── CodeBlock.astro       # framed code panel (header + body slot)
    │   └── ImagePlaceholder.astro
    └── pages/
        ├── index.astro           # home
        ├── projects/index.astro  # all projects
        ├── projects/[slug].astro # project detail (case study + sticky sidebar)
        ├── notes/index.astro     # all notes
        └── notes/[slug].astro    # note detail (prose + related project)
```

## Routes

| Route                       | Source                                        |
| --------------------------- | --------------------------------------------- |
| `/`                         | `src/pages/index.astro`                       |
| `/projects`                 | `src/pages/projects/index.astro`              |
| `/projects/<slug>`          | `src/pages/projects/[slug].astro` ← `projects` collection |
| `/notes`                    | `src/pages/notes/index.astro`                 |
| `/notes/<slug>`             | `src/pages/notes/[slug].astro` ← `notes` collection |

The `<slug>` is the markdown filename (without `.md`) for each entry.

## Content collections

Both collections use Astro's build-time `glob()` loader and Zod schemas defined in `src/content.config.ts`. Frontmatter is type-checked and the resulting types flow through `getCollection()` / `getEntry()` / `render()`.

**`projects`** frontmatter:
- `title`, `tag`, `description`, `lede`, `dateLabel`
- `stack`, `version`, `licence` — render in the sidebar `MetaCard`
- `github` (URL), `install` (string for the install panel)
- `relatedNote?` — slug of a `notes` entry (typed via `reference('notes')`)
- `order?` — number, controls sort on the home grid + projects index

**`notes`** frontmatter:
- `title`, `date` (ISO), `readingTime`, `wordCount?`, `excerpt`
- `hero?` — placeholder label for the hero image (until real art exists)
- `relatedProject?` — slug of a `projects` entry

## Design system

All tokens live as CSS custom properties at the top of `src/styles/global.css`:

| Token | Light | Dark |
| ----- | ----- | ---- |
| `--bg` / `--bg-dark` | `#F5F2EE` | `#1A1814` |
| `--text` / `--text-light` | `#1A1814` | `#F5F2EE` |
| `--accent` / `--accent-dk` | `#A85C3A` | `#C4704A` |
| `--muted` / `--muted-dk` | `#6B6560` | `#A8A29C` |
| `--border` / `--border-dk` | `#D8D4CF` | `#2E2B28` |
| `--surface` / `--surface-dk` | `#EDEAE5` | `#252220` |

Type rule: only display headings (`h1.display`, `h1.page-title`, `h2.section`, `h3.sub`, `.card-title`, `.archive-title`) are lowercased. Body copy, captions, stack values, and proper nouns keep natural casing.

Theming is handled by `body[data-theme="light" | "dark"]`; an inline script in `BaseLayout` reads `localStorage.theme` (falling back to `prefers-color-scheme`) before paint to avoid a flash.

## Commands

```sh
bun install        # install deps
bun run dev        # dev server at http://localhost:4321
bun run build      # static build to ./dist/
bun run preview    # preview the production bundle
bun astro check    # type-check Astro + collection schemas
```

## Editing content

To add a project or note, drop a new `.md` file into the relevant `src/content/<collection>/` directory with the frontmatter shown above. The slug comes from the filename. Routes are generated at build time.

Project case studies often interleave prose, a code snippet, and a screenshot. Markdown body content can include raw HTML (`<div class="code">…</div>`, `<div class="img-placeholder">…</div>`) at the right insertion points — this is how `src/content/projects/garlic.md` preserves the prototype's exact layout.
