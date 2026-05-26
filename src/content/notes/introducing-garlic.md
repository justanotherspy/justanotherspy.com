---
title: introducing garlic
date: 2026-04-12
readingTime: '3 MIN READ'
wordCount: '320 WORDS'
excerpt: 'Steve Yegge says AI tools have a vampiric effect on us — not because they''re bad at the work, but because they''re so good at it. garlic is the small CLI I built to ward that off: it counts my Claude Code hours and tells me when to stop.'
hero: 'SCREENSHOT · garlic nudging me toward a break'
relatedProject: garlic
---

I spend a lot of time in Claude Code. More than I'd like to admit — and the problem isn't that the work is bad. It's that it's good, and finishing things quickly is its own little drug.

[Steve Yegge calls this the AI vampire](https://steve-yegge.medium.com/the-ai-vampire-eda6e4f07163): the tools don't drain you by being useless, they drain you by being so useful you forget to stop. Every shipped task is a hit of dopamine, and the dopamine keeps you in the chair long after your best three or four hours are spent. I'm sensitive to that loop, so I built a small thing to interrupt it.

## what it does

garlic hooks into Claude Code and quietly counts how long I've actually been engaged each day — the agent's time and my own, unioned across however many sessions I've got running. As the hours add up it nudges me to take a break: gentle at first, firmer later, and a distinct "go to sleep" if I'm still going near midnight. How sharp it gets is a setting — gentle, firm, or spicy.

It's a single Rust binary with no runtime to install, everything stored locally under `~/.garlic/`, and nothing leaving the machine unless I opt in. The full case study is on the [project page](/projects/garlic).

## what it isn't

It is not a productivity tracker. It doesn't score me, categorise my work, or summarise anything into a Slack channel. It doesn't even know what I was doing — only that I was doing it, and for how long. The whole point is to notice when the candle's burning low and put it down for the night.

The repository is open; the rest is on [GitHub](https://github.com/justanotherspy/garlic).
