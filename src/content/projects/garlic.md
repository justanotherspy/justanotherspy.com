---
title: garlic
tag: 'CLI TOOL · PYTHON'
description: 'Session-time tracking for Claude Code. Know where your hours go.'
lede: 'Session-time tracking for Claude Code. Know where your hours go.'
dateLabel: 'CLI TOOL · 2026'
stack: 'Python · Click · SQLite'
version: 'v0.4.1 · April 2026'
licence: MIT
github: 'https://github.com/'
install: 'pipx install garlic'
relatedNote: introducing-garlic
order: 1
---

## the problem

I lose hours in Claude Code in the same way I used to lose hours in tmux: not because the work is unproductive, but because the boundaries are invisible. There is no end-of-shift bell. No clock-out. Without a record, the day collapses into a single shapeless block of "coding".

I wanted a small, local thing that would notice when I was working, when I stopped, and at the end of the day tell me a single honest sentence about it.

## architecture

garlic is a Click-based CLI with a SQLite store living under `~/.garlic/`. A lightweight session detector watches Claude Code's process tree and stdin/stdout activity; an idle threshold closes a session after 8 minutes of silence. Everything is local. No daemon, no telemetry, no network calls of any kind.

The summary command is the entire user interface. A single line: total time, session count, average length. That is the design.

## design decisions

- **Local only.** A session tracker that phones home is a contradiction. SQLite plus the file system, nothing else.
- **One-line output.** The whole point is to know without thinking. Anything more is noise.
- **Passive capture.** The user shouldn't start or stop anything. If they have to think about the tool, the tool has failed.
- **Boring tech.** Python, Click, SQLite. The novelty should be in the idea, not the stack.

## install

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>INSTALL &amp; FIRST RUN</span></div>
  <div class="code-body"><span class="tc"># install</span>
<span class="tk">$</span> pipx install garlic

<span class="tc"># run a summary</span>
<span class="tk">$</span> garlic session <span class="tk">--today</span>
<span class="tc">→ 04h 12m across 6 sessions, avg 42m</span></div>
</div>

## what it doesn't do

garlic doesn't categorise your work, score your productivity, or send you a weekly email. It also doesn't know what you were doing. Only that you were doing it. The point is to notice the shape of your day, not to perform it.

<div style="margin-top: 28px;">
  <div class="img-placeholder" style="aspect-ratio: 16/9;">SCREENSHOT · garlic session summary in a terminal</div>
  <div class="img-cap">A typical morning, summarised in one line.</div>
</div>
