---
title: "Three Techniques from Building an AI Personal Tutor"
date: "2026-06-13T12:00:00"
description: "Filesystem state, Markdown summaries with rich HTML over Tailscale, and stable IDs — what's working in Aleph."
tags: ["projects", "ai-assisted"]
featured: true
---

Using AI assistants as personal tutors is an area I've been pushing on
for a while — through [OpenClaw](https://openclaw.ai/),
[pug-claw](https://github.com/mattjmcnaughton/pug-claw), and now
[Hermes](https://hermes-agent.nousresearch.com/) (the pug-claw → Hermes
migration is its own post, owed soon). The hypothesis: a small,
persistent agent that drips short personalized lessons over time moves
me further on a topic than ad-hoc chat sessions do.

Aleph (א — the first letter of the Hebrew alphabet, fitting for a tutor
that delivers foundations) is my expression of that. The first version
ran on both pug-claw and Hermes: lessons grouped into learning paths, an
`ack` flow to confirm completion, SQLite for state, flashcard
suggestions on top. It worked, but the lessons felt ephemeral. Discord
is great for delivery, lousy as a long-term home for rich learning
material.

Aleph-v2 keeps Discord as the interaction layer but moves the durable
artifacts elsewhere. It isn't open source — the interesting part is the
techniques, not the code. Together they compose into roughly 95% of
what I originally thought I needed a standalone app to build.

Three techniques are doing the heavy lifting.

## 1. Filesystem + SQLite as state storage

SQLite stores the structured stuff: lessons, learning paths, `ack`s,
flashcards, scheduling. The filesystem holds the rendered artifacts —
Markdown summaries and HTML deep dives — sitting next to the database
file. Together, that's the entire backend. No server framework, no ORM,
no migrations service. Backing up the tutor is `cp` plus
`sqlite3 .backup`. Inspecting state is `sqlite3 aleph.db`. When the next
agent run needs to know what I've completed, it queries the same
database — no API to design or version. The scheduler leans on this
directly: each run, it queues a new lesson on every stream that's "up
to date" (all prior lessons acked), with no coordination layer beyond
the database itself.

For personal tooling, the database _is_ the application boundary. Skip
the layer that wraps it.

## 2. Markdown summary in Discord, rich HTML over Tailscale

Discord gets a short Markdown summary — something I can read on my phone
in a minute. The full lesson is a self-contained HTML file (CSS inlined,
no JS framework, syntax-highlighted code, embedded diagrams) served from
my homelab over [Tailscale](https://tailscale.com/). From my phone or
iPad, the link Just Works — no auth flow to build, no public deployment,
no app store.

This is the move that killed the "I need to build a real app" impulse.
A directory of static HTML files behind Tailscale gets me a private
reading experience across every device I own with zero infrastructure.
Markdown for the glance, HTML for the depth — and the same agent
generates both in one pass.

## 3. Stable IDs for cross-session reference

Every lesson, flashcard, and learning path has a stable ID exposed in
the artifacts themselves. The `ack` flow is the payoff: I tell the agent
"ack lesson `linalg-eigenvectors-03`, promote the cosine-similarity
flashcard, skip the next one" — and because the IDs survive across
sessions, the agent updates SQLite without reconstructing context. The
design borrows from Matt Pocock's
[`/teach` skill](https://github.com/mattpocock/skills/tree/main/skills/productivity/teach),
which I wrap rather than fork — itself a technique worth naming: wrap
external skills, don't reimplement them.

IDs are the thinnest possible API between me, the artifacts, and the
agent. Without them every interaction starts from scratch.

## Do I still want a standalone app?

Honestly, not really. The missing 5% — richer progress dashboards,
nicer flashcard review UX — is real but not load-bearing, and it's the
part I'd build last anyway. Worth continuing to push on the "do I need
an app for this?" question before reaching for one; the answer keeps
being no.

---

_This post was drafted in collaboration with
[Claude Opus 4.7](https://www.anthropic.com/claude). Attributing when AI
is part of the brainstorming or writing process and tagging those posts
w/ `ai-assisted`._
