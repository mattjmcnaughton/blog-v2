---
title: "Your Blog as a Bootstrap Server"
date: "2026-03-12"
description: "Hosting curl-able scripts and prompts on your personal site."
tags: ["infrastructure", "homelab", "note", "ai-assisted"]
---

I added a `/dl/` path to this blog for hosting downloadable files. Next.js
serves anything under `public/` as a static file, so I just drop files into
`public/dl/` and they're immediately curl-able at a stable URL — no need for
a separate file server or S3 bucket.

So far I'm using it for provisioning scripts for fresh servers, but I think
it'll end up being useful for sharing prompts too.

## Bootstrapping a server

I periodically bring up new machines — bare metal homelab boxes, cloud VMs,
etc. The goal is always the same: get [Tailscale](https://tailscale.com)
installed so I have SSH access over my tailnet. Once I have that, the real
provisioning — Ansible, or increasingly, Claude Code over SSH — can happen
from a machine I actually control.

The annoying part is the gap between "I have console access" and "I have SSH."
You're usually working through some clunky cloud provider UI or IPMI interface,
and you just want to run a couple commands and get out.

So now I can do:

```bash
curl -fsSL https://mattjmcnaughton.com/dl/scripts/bootstrap/install-base-packages-ubuntu-2404.sh -o /tmp/install-base-packages.sh
chmod +x /tmp/install-base-packages.sh
sudo /tmp/install-base-packages.sh
```

Or if you're feeling adventurous — and since I wrote the script, I usually am:

```bash
curl -fsSL https://mattjmcnaughton.com/dl/scripts/bootstrap/install-base-packages-ubuntu-2404.sh | sudo bash
```

The [scripts](https://github.com/mattjmcnaughton/blog-v2/tree/main/public/dl/scripts/bootstrap)
are intentionally boring — each one does one thing, checks if it's already been
done, and logs what it's doing.

Beyond bootstrap scripts, I expect `/dl/` to be useful for anything I want at a
stable, curl-able URL — prompts, config files, GPG keys, etc.

---

**P.S.** I'm experimenting w/ writing more of these shorter posts, inspired by
[Simon Willison's blog](https://simonwillison.net). Tagging them as
`note`. The idea is that writing things down — even small
things — helps me organize my thinking and see patterns. And maybe a snippet
here or there ends up useful to someone else.

---

_This post was drafted in collaboration with
[Claude Opus 4.6](https://www.anthropic.com/claude). I'm still figuring out
what AI attribution should look like on this blog. My rough plan: attribute when
AI is part of the brainstorming or writing process, and tag those posts w/
`ai-assisted`. Posts prior to 2026 had no AI involvement. Expect this to evolve
as I sort out what I actually want from this blog and how AI fits into that._
