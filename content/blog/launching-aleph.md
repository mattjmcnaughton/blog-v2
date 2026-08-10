---
title: "Launching Aleph"
date: "2026-08-10T12:00:00"
description: "Shipping a mobile-friendly AI personal tutor — third time's the charm"
tags: ["projects", "ai-assisted", "learning"]
featured: true
---

Today I’m launching [Aleph](https://aleph.mattjmcnaughton.com).
Name a topic, say how much you already know, and it generates a
structured path you can start working through on your phone the same minute. You
can [try it in your browser](https://aleph.mattjmcnaughton.com) or read the
[source on GitHub](https://github.com/mattjmcnaughton/aleph).

Two months ago I [wrote that I didn’t
want](/blog/three-techniques-ai-personal-tutor) a standalone app for this — that
a Discord bot, SQLite, and static HTML over Tailscale got me 95% of the way
there. I still think that was the right call at the time. But, I wanted to ship functionality
I couldn't with the simple static HTML (i.e. in lesson AI agents, etc).

What’s live today:

- A **generated path** — units and lessons for whatever topic you name, each
  lesson a short Read passage followed by a Quick check. Lessons generate on
  demand as you reach them, so you’re never waiting on a whole path.
- An **AI tutor** you can talk to inside a lesson, and that can reshape the rest of
  your path when you ask it to.
- **Flashcards with spaced repetition**, suggested from lessons you’ve actually
  finished.
- **Streaks**, and deliberately nothing more in the way of gamification.

The interesting part, again, was the shipping process:

- **Docs before code.** Every phase gets a PRD and a TDD before anything is
  written, and `docs/CONTEXT.md` pins the vocabulary — path, unit, lesson, Read
  passage, Quick check — so prose, prompts, and schemas all use the same word for
  the same thing. This turned out to be the single highest-leverage artifact for
  working with agents.

The through-line is the same one from Habagou: spend the effort on making the
planning, delegation, and verification loops short, and let shipping a real
product stay the fixed point. The difference this time is how much of that
leverage came from documents rather than code.

---

_This post was drafted in collaboration with Claude. Attributing when AI is part
of the brainstorming or writing process and tagging those posts w/
`ai-assisted`._
