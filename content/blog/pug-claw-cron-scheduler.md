---
title: "Pug-Claw: Cron Scheduler"
date: "2026-03-25T12:00:00"
description: "Pug-claw now supports cron-driven scheduled agent jobs."
tags: ["projects", "ai-assisted"]
---

Pug-claw now has a [cron scheduler](https://github.com/mattjmcnaughton/pug-claw/pull/6).
You define schedules in `config.json` — a cron expression, an agent, a prompt,
and optionally a Discord channel for output. Each run gets a fresh agent session,
so there's no context bleed between executions. Run metadata lives in SQLite,
rich per-run details go to JSONL audit logs, and everything is keyed by a
searchable `run_id`. A filesystem lock with PID-based stale detection keeps
exactly one scheduler instance active per host.

Right now I'm using it for daily Bible verse study (lesson one was on the Hebrew
word "qavah"), Japanese phrases and bite-sized cultural notes for an upcoming
trip to Japan with my wife, small progressive lessons on topics I want to learn
more about (currently linear algebra and how the non-tech side of clinical trials
works), and exercise tracking check-ins.

I built this with
[pi-coding-agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)
driving GPT 5.4, in a less structured approach than I've been previously using.
One conversation to collaboratively scope and produce the
[PRD/TDD](https://github.com/mattjmcnaughton/pug-claw/blob/main/docs/product/cron-v1-prd-tdd.md),
then a second conversation to execute against it — that one was largely
hands-off. Some light refinement and manual testing against my deployed pug-claw
instance after (a proper staging environment is still a WIP, though the
[backup/restore support](https://github.com/mattjmcnaughton/pug-claw/pull/9) I
just landed should make that straightforward).

---

_This post was drafted in collaboration with
[Claude Opus 4.6](https://www.anthropic.com/claude). Attributing when AI is part
of the brainstorming or writing process and tagging those posts w/ `ai-assisted`._
