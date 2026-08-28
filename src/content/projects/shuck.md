---
title: shuck
tag: 'CLI TOOL · GO'
description: 'Shuck the husk, keep the kernel. A background monitor that tells you the moment CI fails on your PR, with the exact failing step logs already in hand.'
dateLabel: 'CLI TOOL · 2026'
stack: 'Go · go-github'
version: 'v0.4.1 · 2026'
licence: MIT
github: 'https://github.com/justanotherspy/shuck'
install: 'brew install --cask justanotherspy/tap/shuck'
order: 2
---

## the idea

You shuck an oyster to get at the meat. A failing GitHub pull request is the same shape of problem: somewhere inside a red ✕ is the one log line that explains everything, and between you and it sit the Actions UI, a workflow run, a job, a step, and a few thousand lines of setup noise. Click, scroll, expand, squint. Every time.

`shuck` opens the shell in one move. Point it at a PR and it prints exactly the failing steps and the high-signal excerpt of their logs. Not the whole run, not a link to go look at, the actual error, tagged with a coarse class (lint, test, build, timeout, oom, infra) and shown next to the `file:line` annotations the run produced. The rest of the PR comes along for free: review verdicts, unresolved threads, and the repo's open security alerts, all in one report.

Everything shuck does answers one question: what is wrong with the branch I am on right now?

## don't poll CI, be told

The centrepiece is `shuck monitor`, a local background daemon that follows your working tree rather than a PR number. It reads the branch out of `.git/HEAD`, finds the open PR for it, and re-checks on a cadence that tightens while CI is running. Switch branches or move into a worktree and it retargets itself; you never tell it what to watch. A PR your tree can't imply, say one you're waiting on in another repo, goes on the list with `shuck monitor watch`.

When something happens (a run fails, a reviewer comments, an action pin goes stale), the monitor emits an event with the substance already inside: the failing step's log excerpt, or the review comment with its diff hunk and surrounding code. Failures are grouped by run and held until the run settles, so one fail-fast cancellation doesn't become four separate interruptions. A first sighting of a PR reports nothing, because a PR's existing history is not news.

There is nothing to deploy behind any of this. No server, no webhook, no account: one binary, your GitHub token, a local socket. CI enforces that literally, with a build gate that fails if the binary's import graph ever picks up a cloud SDK, a serverless runtime, or a server framework.

## the report commands

Everything the monitor pushes you can also ask for directly:

- `shuck <pr>` is the whole picture: failing CI logs, reviews, and security alerts in one report.
- `shuck logs` is just the failing step logs, for a PR or a single Actions run.
- `shuck reviews` groups a PR's reviews by verdict and collapses resolved threads to one line.
- `shuck pins` audits a checkout's workflows for actions that aren't SHA-pinned or whose pin has gone stale, and `shuck action` resolves the corrected, SHA-pinned line for one action. Pinning is the right thing to do, and looking up digests by hand is why nobody does it.
- `shuck security` lists a repo's open code scanning, secret scanning, and Dependabot alerts.

Some decisions I'd defend. Exit codes are operational: producing a report that shows failures is a success and exits `0`, with `--exit-code` to opt in to gating, because a reporting tool that defaults to failing gets wrapped in `|| true`. Security sources degrade independently: a 404 means the feature is disabled, a 403 means the token can't see it, and either way the source is reported as *skipped*, never as a false all-clear. And `--json` is a contract, versioned and kept separate from the internal types, so refactors can't quietly break whatever parses the output.

Logs are cached whole under `~/.cache/shuck`, so asking the same question twice, or asking again with `--full` for more context, costs no network. Every parser of untrusted input is fuzzed, with minimized crashers committed as regression seeds before the bug gets fixed.

## built for claude code

The honest reason shuck exists: I kept watching coding agents debug CI the hard way, paging through raw API responses looking for the error. So shuck also ships as a Claude Code plugin through [justanotherspy/claude-plugins](https://github.com/justanotherspy/claude-plugins). The plugin arms the monitor for the session's working tree, and each new CI failure or review comment arrives as a notification with the logs already attached. No polling, no tool call, no token spent discovering a fact a webhook knew seconds earlier. A `/shuck` skill covers the on-demand side.

The shuck repo dogfoods this on itself: its own CI failures arrive through its own monitor, which is both the fastest feedback loop and the best test of whether the output is actually good enough.

## install

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>INSTALL &amp; SET UP</span></div>
  <div class="code-body"><span class="tc"># the Homebrew cask (macOS and Linux)</span>
<span class="tk">$</span> brew install --cask justanotherspy/tap/shuck
&nbsp;
<span class="tc"># then wire the skill into Claude Code</span>
<span class="tk">$</span> shuck setup</div>
</div>

Releases are built by GoReleaser with a keyless cosign signature over the checksums, SBOMs, and SLSA provenance: a supply-chain-paranoid pipeline for a tool whose whole job is reading other people's CI. `shuck upgrade` replaces the binary in place after verifying the checksum.

## using it

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>A TYPICAL RED ✕</span></div>
  <div class="code-body"><span class="tc"># why is PR 42 failing?</span>
<span class="tk">$</span> shuck logs justanotherspy/shuck 42
&nbsp;
<span class="tc"># the whole picture: CI + reviews + security</span>
<span class="tk">$</span> shuck 42
&nbsp;
<span class="tc"># follow this working tree in the background</span>
<span class="tk">$</span> shuck monitor watch
&nbsp;
<span class="tc"># pin an action to a SHA, properly</span>
<span class="tk">$</span> shuck action actions/checkout</div>
</div>

From inside a checkout, the PR number alone is enough; shuck works out the repo from git. `--json` gives the same report structured, `--full` and `--context` widen the log excerpt when the one-liner isn't enough, and `--refresh` bypasses the cache when you don't trust it.

## what it doesn't do

shuck never mutates anything. It doesn't re-run jobs, close alerts, or push fixes. It reads, extracts, and reports, and the strongest opinion it will express is a non-zero exit code you asked for. The judgement about what to do with a failure stays with whoever, or whatever, is holding the tool.
