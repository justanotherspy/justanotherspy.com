---
title: shuck
tag: 'CLI TOOL · GO'
description: 'Shuck the husk, keep the kernel. A background monitor that tells you the moment CI fails on your PR, with the exact failing step logs already in hand.'
dateLabel: 'CLI TOOL · 2026'
stack: 'Go · go-github · go-git'
version: 'v1.0.4 · 2026'
licence: MIT
github: 'https://github.com/justanotherspy/shuck'
install: 'brew install --cask justanotherspy/tap/shuck'
order: 2
---

## the idea

You shuck an oyster to get at the meat. A failing GitHub pull request is the same shape of problem: somewhere inside a red ✕ is the one log line that explains everything, and between you and it sit the Actions UI, a workflow run, a job, a step, and a few thousand lines of setup noise. I got tired of clicking, scrolling, expanding and squinting every single time.

`shuck` opens the shell in one move. Point it at a PR and it prints the failing steps and the part of their logs that matters: the actual error, tagged with a coarse class (lint, test, build, timeout, oom, infra) and shown next to the `file:line` annotations the run produced. The rest of the PR comes along for free: review verdicts, unresolved threads, and the repo's open security alerts, all in one report.

Everything shuck does is there to answer one question: what's wrong with the branch I'm on right now?

## don't poll CI, be told

The centrepiece is `shuck monitor`, a local background daemon that follows your working tree rather than a PR number. It reads the branch out of `.git/HEAD`, finds the open PR for it, and re-checks on a cadence that tightens while CI is running. Switch branches or move into a worktree and it retargets itself, so most of the time you never tell it what to watch. A PR your tree can't imply, say one you're waiting on in another repo, goes on the list with `shuck monitor watch`.

When something happens (a run fails, a reviewer comments, an action pin goes stale), the monitor emits an event with the substance already inside: the failing step's log excerpt, or the review comment with its diff hunk and surrounding code. Failures are grouped by run and held until the run settles, so one fail-fast cancellation doesn't turn into four separate interruptions. The first time it sees a PR it reports nothing, because a PR's existing history isn't news.

There's nothing to deploy behind any of this. It's one binary, your GitHub token and a local socket. CI holds me to that with a build gate that fails if the binary's import graph ever picks up a cloud SDK, a serverless runtime, or a server framework.

## the report commands

Everything the monitor pushes you can also ask for directly:

- `shuck <pr>` is the whole picture: failing CI logs, reviews, and security alerts in one report.
- `shuck logs` is just the failing step logs, for a PR or a single Actions run.
- `shuck reviews` groups a PR's reviews by verdict and collapses resolved threads to one line.
- `shuck pins` audits a checkout's workflows for actions that aren't SHA-pinned or whose pin has gone stale, and `shuck action` resolves the corrected, SHA-pinned line for one action. Everyone agrees pinning is right, and nobody does it because looking up digests by hand is tedious.
- `shuck security` lists a repo's open code scanning, secret scanning, and Dependabot alerts.

A few decisions I'd defend. Exit codes are operational: producing a report that shows failures is a success and exits `0`, with `--exit-code` to opt in to gating, because a reporting tool that defaults to failing gets wrapped in `|| true`. Each gate belongs to the command that owns it, so `shuck pins --exit-code` and `shuck security --exit-code` are separate from the CI verdict. Security sources degrade independently: a 404 means the feature is disabled, a 403 means the token can't see it, and either way the source is reported as *skipped* instead of a false all-clear. And `--json` is a contract, versioned and kept separate from the internal types, so refactors can't quietly break whatever parses the output.

Logs are cached whole under `~/.cache/shuck`, so asking the same question twice, or asking again with `--full` for more context, costs no network. Every parser of untrusted input is fuzzed, with minimized crashers committed as regression seeds before the bug gets fixed.

## built for claude code

The honest reason shuck exists is that I kept watching coding agents debug CI the hard way, paging through raw API responses looking for the error. So shuck also ships as a Claude Code plugin through [justanotherspy/claude-plugins](https://github.com/justanotherspy/claude-plugins). The plugin arms the monitor for the session's working tree, and each new CI failure or review comment arrives as a notification with the logs already attached. The agent doesn't have to poll or spend tokens finding out something GitHub knew seconds earlier. A `/shuck` skill covers the on-demand side.

The shuck repo dogfoods this on itself: its own CI failures arrive through its own monitor, which is the fastest feedback loop I have and the best test of whether the output is any good.

## install

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>INSTALL &amp; SET UP</span></div>
  <div class="code-body"><span class="tc"># the Homebrew cask (macOS and Linux)</span>
<span class="tk">$</span> brew install --cask justanotherspy/tap/shuck
&nbsp;
<span class="tc"># then, inside Claude Code, the plugin (monitor + skill)</span>
<span class="tk">&gt;</span> /plugin marketplace add justanotherspy/claude-plugins
<span class="tk">&gt;</span> /plugin install shuck@justanotherspy
&nbsp;
<span class="tc"># or the skill alone, plus a note in ~/.claude/CLAUDE.md</span>
<span class="tk">$</span> shuck setup</div>
</div>

Releases are built by GoReleaser with a keyless cosign signature over the checksums, SBOMs, and SLSA provenance. It's a fairly paranoid pipeline for a tool whose whole job is reading other people's CI, which felt about right. `shuck upgrade` replaces the binary in place after verifying the checksum. There's also an install script, `go install`, and a multi-arch image on GHCR if Homebrew isn't your thing. For auth it takes `GITHUB_TOKEN`, `--token`, or falls back to a logged-in `gh`, which matters for a monitor that outlives the shell you exported a token in.

## using it

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>A TYPICAL RED ✕</span></div>
  <div class="code-body"><span class="tc"># why is PR 42 failing?</span>
<span class="tk">$</span> shuck logs justanotherspy/shuck 42
&nbsp;
<span class="tc"># the whole picture: CI + reviews + security</span>
<span class="tk">$</span> shuck 42
&nbsp;
<span class="tc"># what is the monitor following, and is it green?</span>
<span class="tk">$</span> shuck monitor
&nbsp;
<span class="tc"># pin an action to a SHA, properly</span>
<span class="tk">$</span> shuck action actions/checkout</div>
</div>

From inside a checkout, the PR number alone is enough; shuck works out the repo from git. `--json` gives the same report structured, `--full` and `--context` widen the log excerpt when the one-liner isn't enough, and `--refresh` bypasses the cache when you don't trust it.

## what it doesn't do

shuck never changes anything. It doesn't re-run jobs, close alerts, or push fixes. It reads and reports, and the strongest opinion it will ever give you is a non-zero exit code you asked for. What to do about a failure is up to whoever, or whatever, is holding the tool.
