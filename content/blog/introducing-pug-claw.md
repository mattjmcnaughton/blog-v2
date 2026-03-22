---
title: "Introducing Pug-Claw"
date: "2026-03-21T12:00:00"
description: "A multi-driver AI agent bot framework — and the start of a development blog series."
tags: ["projects", "ai-assisted"]
---

I spent a couple of days last week using OpenClaw and started getting excited about
the possibilities. However, I increasingly wanted the kind of understanding and customization that only comes from
building something yourself — a small footprint tailored exactly to my needs.
So I've started [pug-claw](https://github.com/mattjmcnaughton/pug-claw), a multi-driver AI
agent bot framework in TypeScript and Bun. You define **agents** (system prompt +
skills), pick a **driver** (Claude via Agent SDK, or Pi backed by Codex/OpenRouter), and
connect them to a **frontend** (Discord bot or terminal). It runs self-hosted on
a Dell XPS 13 in my homelab, connected to my tailscale.

This is the first in a series of posts about building pug-claw. The
[roadmap](https://github.com/mattjmcnaughton/pug-claw/blob/main/docs/product/roadmap.md)
covers sessions and persistence, a memory system, and an ecosystem of
specialized agents that can delegate to each other. Follow along on
[GitHub](https://github.com/mattjmcnaughton/pug-claw) or here.

---

_This post was drafted in collaboration with
[Claude Opus 4.6](https://www.anthropic.com/claude). Attributing when AI is part
of the brainstorming or writing process and tagging those posts w/ `ai-assisted`._
