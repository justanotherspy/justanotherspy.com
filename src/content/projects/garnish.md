---
title: garnish
tag: 'CLI TOOL · RUST'
description: 'A fast, cached, themeable status line for Claude Code. Model, context, rate limits, cost and git state, laid out from a TOML config, in under 3 ms a tick.'
dateLabel: 'CLI TOOL · 2026'
stack: 'Rust · clap · ratatui · jiff'
version: 'v0.3.1 · 2026'
licence: MIT
github: 'https://github.com/justanotherspy/garnish'
install: 'brew install --cask justanotherspy/tap/garnish'
order: 3
---

## the idea

Claude Code runs your status line command every second and shows whatever it prints at the bottom of the session. That's prime real estate, and most of us fill it with a shell one-liner that prints the branch name. I wanted the things I actually glance at while working: which model, how full the context window is, how close I am to the five-hour and weekly limits, what the session has cost, and where the branch stands against its upstream.

`garnish` is that status line. It reads the JSON snapshot Claude Code pipes in, renders a small dashboard from a TOML config, and gets out of the way.

<div class="code">
  <div class="code-hdr"><span>CLAUDE CODE</span><span>THE DEFAULT PRESET</span></div>
  <div class="code-body">╭─ ❒ ~/projects/garnish │ ⇄ #42 ❍ ───────────────────────── ❯ garnish-dev ─╮
├─ ❖ Opus │ ⚙ ▁▃▅▇█ │ ⊞ ████████▍░░░░░░░░░░▏ 42% ──────────────────────────┤
├─ ⏳ 24% ⏱ 2h13m │ ≣ 41% ⏱ 3d4h ───────────────────────────── Δ +156 −23 ─┤
╰─ ⏱ 1h12m │ ⇄ 8m20s │ ⛁ 91% 1h ✦ 47m ──────────────────────── ⠋ 16:00:00 ─╯</div>
</div>

## how it works

There are 25 modules in six groups (repo, model, usage, session, identity, harness), plus text boxes of your own. Any module can go on any line, and lines can be split into columns, titled, and boxed. There are four built-in presets and a gallery of 33 more: panels, grids, tickers, animated spinners, and plain ASCII for terminals without the fancy glyphs. Colour themes, Nerd Font or unicode icons, and OSC 8 links are all config.

The rule that shapes everything is that a tick never waits. Anything slow, which in practice means git, runs in a detached background worker that writes to a small cache, and the tick renders whatever the cache last said. A value that's gone stale dims with a `⟳` instead of holding up the line. The budget is a warm tick under 3 ms on average and under 8 ms at p99, with a hyperfine gate that fails if it slips, because dozens of sessions on one machine shouldn't notice it.

It also never fails loudly. Claude Code clears the status line on a non-zero exit, so garnish always exits `0`: a broken config key falls back to its default and adds a dim `⚠` row saying which line is wrong, and bad input becomes a one-line warning in place of the dashboard.

## how it's built

garnish is Rust, and the lints are about as strict as Rust lets you be: pedantic and nursery clippy on, and every panic path denied outside tests. No `unwrap`, no indexing, no `as` casts, no unchecked arithmetic. It makes no network calls at all.

It runs git on a timer in whatever directory the session is in, which might be a repo someone else made, so it treats the repository as untrusted. Files under `.git` are only read if they're regular files under a size cap, so a planted FIFO can't hang it. The dirty check uses git's plumbing so a repo's filter drivers never run, and git only ever comes from an absolute `PATH` entry, never from the checkout.

The module schema is the single source of truth: the docs, the annotated example config and the setup screen are all generated from it, and a test fails if they drift. Every module renders through a matrix of presets, icon sets, widths and payload fixtures, checked against golden files.

The whole thing is written by Claude Code, session by session. The repo carries the rules (`CLAUDE.md`), the design (`SPEC.md`), the plan and a daily work log, and every phase ends with an adversarial review subagent trying to break what was just built.

## install

<div class="code">
  <div class="code-hdr"><span>BASH</span><span>INSTALL &amp; SET UP</span></div>
  <div class="code-body"><span class="tc"># the Homebrew cask (macOS and Linux)</span>
<span class="tk">$</span> brew install --cask justanotherspy/tap/garnish
&nbsp;
<span class="tc"># pick a preset, preview it, and install it</span>
<span class="tk">$</span> garnish setup</div>
</div>

`garnish setup` opens a small terminal screen where you scroll through the presets, each previewed at your terminal's width. Accept, and it writes your config, adds the `statusLine` block to `~/.claude/settings.json` (with a backup), and installs three Claude Code skills: one for building a config by describing what you want, one for feedback, and one for submitting a preset to the gallery. `garnish setup --preset default --install` does the same without the screen. It needs Linux or macOS and a recent Claude Code.

Releases are signed tags with prebuilt binaries for Linux and macOS on x86_64 and arm64, and the cask only goes to the tap after I approve the run.

## using it

<div class="code">
  <div class="code-hdr"><span>BASH</span><span>DAY TO DAY</span></div>
  <div class="code-body"><span class="tc"># browse the gallery</span>
<span class="tk">$</span> garnish presets
&nbsp;
<span class="tc"># try a look before you commit to it</span>
<span class="tk">$</span> garnish preview payload.json --preset compact --theme nord
&nbsp;
<span class="tc"># something looks off? check the whole chain</span>
<span class="tk">$</span> garnish doctor</div>
</div>

Most of the time I don't touch it. When I want a change I run `garnish setup` again, or ask Claude, which has the config-building skill to hand. If the icons show up as boxes, the terminal font has no Nerd Font glyphs, and switching to the `unicode` icon set fixes it.

## what it doesn't do

garnish doesn't run arbitrary commands. The module set is fixed, and text boxes are static strings, never commands or files, so a config can't turn the status line into a way to run something every second. It doesn't read your transcript, doesn't run a daemon, doesn't support Windows, and doesn't phone home. It reads what Claude Code hands it, asks git a few cheap questions in the background, and draws.
