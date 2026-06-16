---
title: dead-drop
tag: 'INGEST API · TYPESCRIPT'
description: 'The anonymous tip line behind the site. A hostile-input ingest API that takes a message from a stranger and lands it in Slack — without ever trusting the sender.'
lede: 'The anonymous tip line behind the site. A hostile-input ingest API that takes a message from a stranger and lands it in Slack — without ever trusting the sender.'
dateLabel: 'INGEST API · 2026'
stack: 'TypeScript · Hono · Cloudflare Workers · Queues'
version: 'v0.1.0 · 2026'
licence: MIT
github: 'https://github.com/justanotherspy/dead-drop'
install: 'git clone justanotherspy/dead-drop && make dev'
order: 3
---

## the idea

A dead drop is the bit of spycraft where two people who never meet still pass a message — you leave it somewhere agreed, and someone else collects it later. The submission form on this site is exactly that shape: a stranger leaves a note, and it surfaces in a private Slack channel I read when I get to it. No account, no email, no thread to be answered in. Optionally not even a name.

`dead-drop` is the small API behind that form. Its whole job is to take a message from someone I've never met — and never authenticated — and get it to me intact, without trusting a single thing about the sender. Public, unauthenticated, and writing into my Slack: that combination means abuse is the default case, not the edge case, so the whole design starts from "assume the next request is hostile."

## how it works

The pipeline is four moves: validate, rate-limit, sanitize, enqueue — then return. Everything that can fail slowly happens after the response has already gone out.

```
POST /  →  Cloudflare Queue  →  consumer  →  private Slack channel
```

The ingest Worker does only the synchronous, cheap work and answers `202 Accepted` the moment the message is safely on the queue. A durable Cloudflare Queue sits between ingest and Slack so that a Slack outage — or just Slack being slow — never blocks a submission and never drops one. A separate consumer drains the queue, formats each message as Slack Block Kit, and posts it. If Slack keeps failing, the message retries with backoff and eventually lands in a dead-letter queue rather than vanishing.

A few decisions I'd defend:

- **The response never echoes the message.** Not in the success body, not in an error, not anywhere. The endpoint answers in fixed, minimal bodies (`{ "ok": true }`), so there's no reflection surface to turn the tip line into a way to bounce content off my origin.
- **The honeypot gets a `202`, not a `403`.** The form carries an off-screen `company` field that humans never fill in. When a bot fills it, the message is silently discarded — but the response is the same `202` a real submission gets, so the bot learns nothing about being caught. Rejection is a signal; I'd rather not give one.
- **Nothing identifying is queued.** The sender's IP is used for rate-limiting at ingest and then thrown away. It never enters the queued payload — the consumer only ever sees what it needs to post the message, never who sent it.

## not trusting the sender

Every field arrives hostile and is treated that way. Types and lengths from the client are re-validated server-side rather than believed: `message` is required and capped at 2000 characters, `alias` is optional and capped at 80, and `alias` is ignored entirely when the submission is anonymous. Text is trimmed, control characters stripped, and Unicode normalized before anything downstream sees it.

The message is plain text from end to end — it is never rendered as HTML anywhere in the pipeline. When the consumer composes the Slack post, it escapes Slack's own `mrkdwn` control characters, including the leading `@`, `#`, and `!` that would otherwise let a submitted string trigger a mention or ping a channel. A stranger's message can't reach into my Slack and make it do something.

Rate limiting runs in two layers, counted *before* anything is enqueued so a flood can't fill the queue. Per-IP limits — a few requests a minute, a couple of dozen an hour — are enforced with Cloudflare's native rate-limiting binding plus a KV-backed hourly window, and a global hourly ceiling sits behind both as a backstop against a distributed flood, held in a Durable Object so the limit is strict rather than approximate. Over the limit you get a `429` and a `Retry-After`, and the queue stays untouched.

## how it's built

dead-drop runs on Cloudflare Workers in TypeScript, with [Hono](https://hono.dev) for routing. The platform choice is most of the security story: the Worker is the edge, so rate-limiting and WAF rules live in the same place the request first lands, and Queues, KV, and Durable Objects are all first-party bindings rather than services to stand up and secure separately.

The consumer's Slack delivery is idempotent — keyed on the payload's `id` in KV — so a queue message redelivered after a partial failure posts once, not twice. CORS is locked to the site origin rather than left open. The Slack bot token lives in Wrangler's secret store in production and a gitignored `.dev.vars` locally; it is never in the client and never in the repo. Deploys are gated behind a required-reviewer GitHub Environment, so the thing with write access to my Slack can't ship on a whim.

It's covered by unit tests running inside the Workers runtime via `@cloudflare/vitest-pool-workers`, plus an end-to-end smoke test that boots the local stack and drives the real endpoint. The Durable Object's window logic is factored into a pure function so the ceiling can be tested without the runtime.

## using it

There's nothing to install to *use* it — you use it by submitting the form at [/dead-drop](/dead-drop). But the contract is simple enough to drive by hand:

<div class="code" style="margin-top: 14px;">
  <div class="code-hdr"><span>BASH</span><span>A SUBMISSION</span></div>
  <div class="code-body"><span class="tc"># an anonymous drop</span>
<span class="tk">$</span> curl -sX POST https://dead-drop.justanotherspy.com/ \
    -H 'content-type: application/json' \
    -d '{"message":"the eagle lands at noon","anonymous":true}'
<span class="tc"># → 202 {"ok":true}</span>
&nbsp;
<span class="tc"># signed, with an alias</span>
<span class="tk">$</span> curl -sX POST https://dead-drop.justanotherspy.com/ \
    -H 'content-type: application/json' \
    -d '{"message":"call me","anonymous":false,"alias":"a friend"}'</span></div>
</div>

The client treats any `res.ok` as success and only special-cases `429`. Everything else — bad JSON, an empty message, a body over the cap — comes back as a fixed, minimal error that says what was wrong with the request and nothing about what was in it.

## what it doesn't do

dead-drop doesn't reply, doesn't store a history, and doesn't try to work out who you are. There's no inbox, no read receipt, no way for me to write back through it — by design, a one-way channel that ends in a Slack message. It keeps no identifying metadata once a message is on the queue, so even I can't tell who left what. The point of a dead drop is that the drop is all there is.
