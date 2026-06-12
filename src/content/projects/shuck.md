---
title: shuck
tag: 'CLI TOOL · GO'
description: 'Crack a failing PR open and get the part that matters: the exact failing CI step logs, the reviews, the security findings.'
lede: 'Crack a failing PR open and get the part that matters: the exact failing CI step logs, the reviews, the security findings.'
dateLabel: 'CLI TOOL · 2026'
stack: 'Go · go-github · MCP'
version: 'v0.4.1 · 2026'
licence: MIT
github: 'https://github.com/justanotherspy/shuck'
install: 'brew install --cask justanotherspy/tap/shuck'
order: 2
---

## the idea

You shuck an oyster to get at the meat. A failing GitHub pull request is the same shape of problem: somewhere inside a red ✕ is the one log line that explains everything, and between you and it sit the Actions UI, a workflow run, a job, a step, and a few thousand lines of setup noise. Click, scroll, expand, squint. Every time.

`shuck` opens the shell in one move. Point it at a PR and it prints exactly the failing steps and the high-signal excerpt of their logs — not the whole run, not a link to go look at, the actual error. The rest of the PR comes along for free: review verdicts and unresolved threads, the repo's open security alerts, all in one report.

## how it works

The pipeline is deliberately cheap-first: resolve the PR (from arguments, or from whatever repo you're standing in), fetch the check metadata, and only then drill into the jobs that actually failed to pull their logs. Inside each log it finds the failing step's section, extracts the error excerpt, and renders that. The step commands come from the logs themselves rather than the workflow YAML, so it works on any workflow without needing to understand it.

Everything is cached under `~/.cache/shuck`. On the same head commit the raw job logs are kept whole and re-parsed locally, so asking the same question twice — or asking it again with `--full` for more context — costs no network at all. `shuck --watch` polls until CI finishes, then reports, which turns "push and check back later" into one command.

A few decisions I'd defend:

- **Exit codes are operational, gating is opt-in.** Producing a report that shows failures is a success, and exits `0`. If you want the exit code to follow the verdict — in CI, say — `--exit-code` turns that on. A reporting tool that defaults to failing was always going to get wrapped in `|| true`.
- **Soft degradation, never false results.** Security and settings reads degrade independently: a 404 means the feature is disabled, a 403 means the token can't see it, and either way the check is reported as *skipped* — never silently passed or failed. An answer shuck can't verify is an answer it doesn't give.
- **`--json` is a contract.** The JSON schema is versioned and kept separate from the internal types, so refactors can't quietly break whatever's parsing the output.

## more than logs

Once the plumbing existed for "ask GitHub a precise question and render an honest answer", more questions fit through the same pipe. `shuck security` lists a repo's open code scanning, secret scanning, and Dependabot alerts. `shuck compliance` checks the repo's live settings — branch protection, merge rules, Actions policy — against a policy file committed to the repo, and exits loudly on drift. `shuck dependabot` audits the Dependabot config against the ecosystems the repo *actually* contains, found by walking its file tree. And `shuck action` / `shuck image` resolve the latest matching release of a GitHub Action or GHCR image and print the SHA-pinned line, because pinning is the right thing to do and looking up digests by hand is why nobody does it.

## built for agents

The honest reason shuck exists: I kept watching coding agents debug CI the hard way — paging through raw API responses looking for the error. So the same core ships three ways. A CLI for me. An MCP server (`shuck mcp`) that exposes each report as a typed tool, so an agent gets `inspect_logs` instead of a GitHub API safari. And a Claude Code plugin that wires in the skill and hooks, so the agent reaches for shuck on its own when checks go red.

The shuck repo dogfoods all three — its own CI failures get debugged with shuck, which is both the fastest feedback loop and the best test of whether the output is actually good enough.

## install

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>INSTALL &amp; SET UP</span></div>
  <div class="code-body"><span class="tc"># macOS or Linux — the Homebrew cask</span>
<span class="tk">$</span> brew install --cask justanotherspy/tap/shuck

<span class="tc"># or the install script (no toolchain needed)</span>
<span class="tk">$</span> curl -fsSL https://raw.githubusercontent.com/justanotherspy/shuck/main/install.sh | bash

<span class="tc"># or build from source</span>
<span class="tk">$</span> go install github.com/justanotherspy/shuck@latest

<span class="tc"># then wire the skill + MCP server into Claude Code</span>
<span class="tk">$</span> shuck setup</div>
</div>

Releases are built by GoReleaser with a keyless cosign signature over the checksums, SBOMs, and SLSA provenance — a supply-chain-paranoid pipeline for a tool whose whole job is reading other people's CI. `shuck upgrade` replaces the binary in place after verifying the checksum, and `shuck setup` installs the Claude Code skill and registers the MCP server. Both are idempotent.

## using it

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>A TYPICAL RED ✕</span></div>
  <div class="code-body"><span class="tc"># why is PR 42 failing?</span>
<span class="tk">$</span> shuck logs justanotherspy/shuck 42

<span class="tc"># the whole picture — CI + reviews + security</span>
<span class="tk">$</span> shuck 42

<span class="tc"># push, then wait for the verdict</span>
<span class="tk">$</span> shuck --watch 42

<span class="tc"># pin an action to a SHA, properly</span>
<span class="tk">$</span> shuck action actions/checkout</div>
</div>

From inside a checkout, the PR number alone is enough — shuck works out the repo from git. `--json` gives the same report structured, `--full` and `--context` widen the log excerpt when the one-liner isn't enough, and `--refresh` bypasses the cache when you don't trust it.

## what it doesn't do

shuck never mutates anything — it doesn't re-run jobs, close alerts, or push fixes. It reads, extracts, and reports, and the strongest opinion it will express is a non-zero exit code you asked for. The judgement about what to do with a failure stays with whoever — or whatever — is holding the tool.
