---
title: "Introducing fetch-context"
date: "2026-06-06T12:00:00"
description: "A Claude/Codex skill for pulling library docs, upstream source, and web pages into the working directory."
tags: ["projects", "ai-assisted"]
---

[fetch-context](https://github.com/mattjmcnaughton/skills/tree/main/skills/fetch-context)
is a skill — installable into Claude Code or Codex via
[skillvendor](https://github.com/mattjmcnaughton/skillvendor) — that gives an
agent three deliberate paths for bringing external context into the current
repo:

1. **Docs** via [`context7-cli`](https://github.com/upstash/context7) — curated,
   up-to-date library documentation. The agent searches for a library ID, then
   pulls docs by ID.
2. **Source** via shallow `git clone` into `.agentic/sources/<repo>/` — the
   upstream project lands on disk, ready for `Read`/`Grep`/`Glob`, scoped to the
   repo and gitignored.
3. **URL** via [`https://r.jina.ai/`](https://jina.ai/reader/) — wrap any URL
   to get a clean markdown rendering, much friendlier than raw HTML.

The three modes map directly to three things I kept reaching for:

- **Replicating patterns.** Pointing at a repo and saying "organize the
  Terraform here the way that one does" — pick your own $X. A source clone
  makes the upstream greppable alongside mine, so the agent can mirror
  conventions without me copy-pasting files. _Aside: this is **excellent**
  for infrastructure-as-code — Helm charts, Terraform modules, Kustomize
  overlays, GitHub Actions workflows. The "right" structure is largely
  convention, the conventions live in real repos, and an agent with the
  source on disk can absorb them in one pass._
- **Detailed open-source investigation.** Adding a workflow against a library
  like [Mastra](https://github.com/mastra-ai/mastra) (just one example —
  could equally be any SDK, framework, or CLI), debugging a quirky API call,
  tracing why a dependency does what it does. These all need implementation
  detail the docs don't cover. Cloning the source locally turns "read the
  code" into a one-line ask.
- **Better web retrieval.** Whether it's a changelog, an RFC, a vendor docs
  page, or a blog post — built-in fetch tools tend to choke on heavy pages or
  hand back HTML soup. Routing through `r.jina.ai` consistently produces
  markdown the agent can actually reason over.

The skill itself is mostly a decision guide — when to reach for which path,
how to write a good Context7 query, where to drop clones so they don't pollute
the host repo, what _not_ to send to third-party proxies. The bash commands
are simple; the value is in the agent picking the right tool and using it
well.

Grab it from the
[skills repo](https://github.com/mattjmcnaughton/skills/tree/main/skills/fetch-context),
or vendor it with skillvendor.

---

_This post was drafted in collaboration with
[Claude Opus 4.7](https://www.anthropic.com/claude). Attributing when AI is
part of the brainstorming or writing process and tagging those posts w/
`ai-assisted`._
