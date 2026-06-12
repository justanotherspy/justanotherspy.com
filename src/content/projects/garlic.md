---
title: garlic
tag: 'CLI TOOL · RUST'
description: 'Ward off the AI vampire. Track your Claude Code hours and get nudged to rest.'
lede: 'Ward off the AI vampire. Track your Claude Code hours and get nudged to rest.'
dateLabel: 'CLI TOOL · 2026'
stack: 'Rust · clap · serde'
version: 'v0.3.4 · 2026'
licence: MIT
github: 'https://github.com/justanotherspy/garlic'
install: 'cargo install garlic-ward'
relatedNote: introducing-garlic
order: 1
---

## the idea

Garlic wards off vampires. According to Steve Yegge, AI tools have a vampiric effect on us — and not because they're bad at coding. They drain us precisely because they're good at it. Every finished task is a small hit of dopamine, and the dopamine keeps you in the chair long after the good work has stopped. He reckons there are maybe three or four hours of genuinely good work in a day at that intensity before you start burning your own candle a little too brightly. As someone who feels every hour of that, I tend to agree.

The idea came straight from [his article](https://steve-yegge.medium.com/the-ai-vampire-eda6e4f07163). So I built `garlic`: a small CLI that sits quietly in the background, counts how long I've actually been Clauding, and tells me — gently at first, then less gently — when it's time to close the laptop and go touch some grass.

## how it works

garlic hooks into Claude Code through its [hooks system](https://docs.anthropic.com/en/docs/claude-code/hooks). It listens for a handful of moments — a session starting, a prompt going out, Claude stopping, a session ending — and from those it reconstructs the shape of the day, across however many sessions I've got running at once.

The model is built from intervals. The span from my prompt to Claude's stop is *agent time* — the machine working. The span from stop to my next prompt is *user time* — me reading, thinking, typing. `garlic status` shows the split, so I can see how an hour actually divided between the two.

A few decisions keep the count honest rather than flattering:

- If I vanish for longer than the gap limit (40 minutes by default), garlic assumes I stepped away and counts nothing for that gap. Shorter gaps count in full — reading docs or answering a Slack message is still part of the session.
- Any single response is capped (two hours by default), so a forgotten session left running overnight can't quietly inflate the total.
- Run two agents at once and the overlapping time counts once, not twice. Babysitting two agents is more draining, not more productive, so garlic never rewards it.

As the hours add up, garlic nudges. Every thirty minutes or so it asks Claude to suggest a break — once per threshold, so it isn't nagging on every prompt — and the last one is more of a "session's over." If I'm still going in the hour before the daily reset, it sends a distinct bedtime nudge: wrap up, get some sleep. How sharp those nudges get is up to me: gentle, firm, or spicy. Whatever the style, each nudge reaches Claude wrapped in a fixed relay instruction — pass this along at the next natural moment, don't change what you're doing — so even the spiciest "session's over" never derails the task in flight.

## how it's built

garlic is a single self-contained Rust binary. No Python, no Node, nothing to install but the one file. It runs on every prompt I send, so I wanted it small, boring, and fast.

That constraint shaped the dependencies. Rust's standard library has no TOML parser, argument parser, or HTTP client, so there's a short and deliberately dull list of widely-used crates — clap, serde, toml, chrono — pinned in a committed lockfile, with `cargo audit` running in CI on every push. The whole supply chain is something I can read in an afternoon, on purpose.

State lives under `~/.garlic/`: a config file and a tracking file, the latter behind a file lock so several concurrent sessions can share one honest daily total. By default nothing ever leaves the machine — no telemetry, no network calls — with two opt-in exceptions: a once-a-day version check against crates.io, and an optional self-hosted backend (a small axum + Redis service) for people running Claude across several machines who want a single shared total. garlic is local-first either way: the hooks always write locally and never block on the network, so tracking keeps working offline and syncs later.

One last thing worth saying. Every nudge garlic can send is hardcoded in the source — there's no path for outside input to shape what reaches your agent. You can read every possible message in a single file.

## install

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>INSTALL &amp; SET UP</span></div>
  <div class="code-body"><span class="tc"># macOS — the Homebrew cask</span>
<span class="tk">$</span> brew install --cask justanotherspy/tap/garlic

<span class="tc"># anywhere with a Rust toolchain</span>
<span class="tk">$</span> cargo install garlic-ward

<span class="tc"># no toolchain? grab a prebuilt binary</span>
<span class="tk">$</span> cargo binstall garlic-ward

<span class="tc"># then wire the hooks into Claude Code</span>
<span class="tk">$</span> garlic setup</div>
</div>

On macOS the easiest path is the Homebrew cask; the tap is republished on every release, so `brew upgrade --cask garlic` keeps it current. Anywhere with a Rust toolchain, `cargo install garlic-ward` builds it from source — and if you'd rather not, `cargo binstall garlic-ward` pulls a prebuilt binary instead. Either way, `garlic setup` walks through the key preferences — or takes `-y` and just uses the defaults — then adds the hooks to `~/.claude/settings.json`. It's idempotent, so it's safe to re-run whenever you need to repair things.

garlic also ships as a Claude Code plugin via my central marketplace, [justanotherspy/claude-plugins](https://github.com/justanotherspy/claude-plugins) — the same hooks and `/garlic` command, without touching `~/.claude/settings.json`. Pick one mechanism, not both: the plugin and `garlic setup` register the same hooks, and running both counts every event twice.

## using it

Day to day I barely touch it; that's the point. The one command I actually look at is `garlic status` — today's total and the agent/user split, with `--week` and `--month` for the longer view.

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>A TYPICAL DAY</span></div>
  <div class="code-body"><span class="tc"># how long have I been clauding today?</span>
<span class="tk">$</span> garlic status

<span class="tc"># feed one line into the status bar → 🧛 2h 15m / 4h · agent 1h 30m · user 45m</span>
<span class="tk">$</span> garlic statusline

<span class="tc"># turn up the bedside manner</span>
<span class="tk">$</span> garlic set nudge_style=spicy

<span class="tc"># done thinking about it for today (tracking continues)</span>
<span class="tk">$</span> garlic ignore</div>
</div>

`garlic statusline` feeds a single line into Claude Code's status bar — `🧛 2h 15m / 4h · agent 1h 30m · user 45m`, my accumulated time against the daily target, split into agent and user time. The icon is the vampire while I'm working — being drained — and flashes to garlic 🧄 for one refresh when a fresh nudge has just fired, so the ward briefly shows when garlic speaks up. There's also a `/garlic` slash command so I can check the same numbers without leaving the conversation. Settings live in `~/.garlic/config.toml`, but `garlic set` edits them in place when I can't be bothered to open the file.

## what it doesn't do

garlic doesn't score my productivity, categorise my work, or mail me a weekly report. It doesn't know what I was doing — only that I was doing it, and for how long. It was built with Claude Code, which is either ironic or exactly right. The point was never to perform the day. It's to notice when the candle's burning low, and put it down for the night.
