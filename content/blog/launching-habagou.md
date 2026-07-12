---
title: "Launching Habagou"
date: "2026-07-12T12:00:00"
description: "Shipping a Chinese handwriting practice app with an agent-driven development loop."
tags: ["projects", "ai-assisted", "learning"]
featured: true
---

Today I’m launching [Habagou](https://habagou.mattjmcnaughton.com), named for
the Chinese word for pug: 哈巴狗 (_hābāgǒu_). It’s a web app for practicing how to
write Chinese characters, one stroke at a time. You can [try it in your
browser](https://habagou.mattjmcnaughton.com) or read the
[source on GitHub](https://github.com/mattjmcnaughton/habagou).

The interesting part was the shipping process:

- **Claude Design** generated screenshots and mocks to make the product feel
  concrete before implementation.
- **Fable** turned features—such as adding authentication—into plans and
  GitHub tickets.
- **Fable and GPT 5.5** drove ticket execution with parallel subagents where
  appropriate. I used the built-in browsers in both Claude and Codex Desktop
  to keep the loop moving; some runs worked independently for more than an
  hour.
- **Fly.io, Neon, and Auth0** got the app into production without turning the
  homelab into the hosting platform.

The through-line was simple: use the agents to make the planning, delegation,
and verification loops shorter, then keep the goal fixed on shipping a real
product.

---

_This post was drafted in collaboration with GPT 5.6-terra. Attributing when
AI is part of the brainstorming or writing process and tagging those posts w/
`ai-assisted`._
