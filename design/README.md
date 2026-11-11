# Design

The design system for this site is a Claude Design artifact, not a file in this
repo:

https://claude.ai/artifact/RbEXZgp6YzpN4SG38mPWBV

It holds the tokens (`tokens.json`), the class layer (`components/bundle.css`),
a guideline and a live preview per component, the fonts, the favicon and the
writing rules. It is private to Daniel's account, so a session that cannot open
it works from the shipped copy described below.

## What lives in the repo

- `src/styles/global.css` is the shipped implementation. Its token block
  mirrors `tokens.json` and its class layer is kept identical to
  `components/bundle.css`.
- `public/fonts/` has the same DM Serif Display and IBM Plex Mono files.
- `public/favicon.*` and the PNG icons are the "js" mark, also stored in the
  design system.
- `dead-drop-design.md` and `dead-drop-api.md` are the page and API specs for
  the dead drop. They are not part of the design system.

## Changing the design

Change the artifact and `global.css` in the same piece of work. A token that
changes in one place and not the other is how the two drifted apart before.

The earlier prototype (`Prototype v4.html`), the identity document and the
handoff notes that used to live here were removed in November 2026. They
described the warm terracotta palette the site no longer uses. They are in git
history if they are ever needed.
