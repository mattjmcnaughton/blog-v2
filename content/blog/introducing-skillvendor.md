---
title: "Introducing skillvendor"
date: "2026-05-25T12:00:00"
description: "A small Go binary for vendoring remote skills into Claude Code and Codex."
tags: ["projects", "ai-assisted"]
---

[skillvendor](https://github.com/mattjmcnaughton/skillvendor) is a small Go
binary that vendors remote skills from git repos into `~/.claude/skills` and
`~/.codex/skills`. You declare sources in a manifest, it resolves them to
commit SHAs in a lockfile, and `sync` keeps the symlinks reproducible across
machines. The manifest and lockfile live under `~/.config/skillvendor/`, so
they can ride along with my dotfiles the same way a `tmux.conf` or `nvim`
config does.

A few shifts in how I'm working with agents drove this:

- **Consolidating on skills.** Foregoing the Claude-only commands/skills
  split — skills work across Claude Code and Codex, and that portability is
  worth more to me than Claude-specific affordances.
- **Leaning on open-source skills.** Folks like
  [@mattpocock](https://github.com/mattpocock) are publishing genuinely good
  skills. I'd rather pull those in (pinned to a SHA) than reinvent them.
- **Single compiled binaries.** Go lets me ship one static binary with no
  runtime dependency chain — meaningfully smaller supply-chain surface than
  a Node or Python equivalent.
- **Trivial Homebrew packaging.** Brew works on Mac and Linux, so a
  [tap](https://github.com/mattjmcnaughton/homebrew-tap) is the cheapest way
  to make a tool installable everywhere I care about.

I'm 100% sure there are other tools that do roughly the same thing — but it
was fun and trivial to build my own, and one less third-party dependency in
the path between a git repo and my agent config.

---

_This post was drafted in collaboration with
[Claude Opus 4.7](https://www.anthropic.com/claude). Attributing when AI is
part of the brainstorming or writing process and tagging those posts w/
`ai-assisted`._
