---
title: "Lessons Learned from Kubernetes Contributions"
date: "2020-12-10"
description: "Reflections on contributing to Kubernetes and what I learned about large-scale open source projects."
tags: ["kubernetes", "open-source", "career", "community"]
---

Contributing to Kubernetes was one of the most valuable experiences of my career. Not because of the code I wrote, but because of what I learned about large-scale collaboration and software engineering at scale.

## How Kubernetes Actually Works

From the outside, Kubernetes seems like it's built by Google. The reality is more interesting - it's a decentralized collaboration of hundreds of contributors across dozens of companies, organized into Special Interest Groups (SIGs).

Each SIG owns a piece of the project:

- **sig-node**: Kubelet, container runtime, node lifecycle
- **sig-network**: Networking, services, ingress
- **sig-storage**: Persistent volumes, CSI
- **sig-api-machinery**: API server, controllers

Getting anything done requires navigating this structure, building relationships, and understanding the governance.

## Lessons That Transfer Everywhere

**1. Design docs before code**

In Kubernetes, significant changes require a KEP (Kubernetes Enhancement Proposal). Writing the KEP forces you to think through:

- What problem are you solving?
- What alternatives did you consider?
- What are the risks?
- How will you test it?
- What's the rollout plan?

I now write mini-design docs for any non-trivial feature at work.

**2. Incremental delivery beats big bangs**

Large changes get stuck. They're hard to review, hard to test, and accumulate merge conflicts. The PRs that got merged quickly were small, focused, and built on each other.

```
# Instead of one massive PR:
PR: "Implement graceful node shutdown"  # 2000 lines, sits in review for months

# Do this:
PR 1: "Add shutdown signal handler" # 100 lines
PR 2: "Implement pod priority sorting" # 150 lines
PR 3: "Add configurable grace periods" # 200 lines
PR 4: "Wire up components for shutdown flow" # 250 lines
```

**3. Tests are documentation**

The best way to understand how Kubernetes components work is to read the tests. Well-written tests tell you:

- What inputs are valid
- What behavior is expected
- What edge cases exist

I now write tests that someone unfamiliar with the code could read and understand the feature.

**4. Community is the moat**

What makes Kubernetes successful isn't just the technology - it's the community. The contributor experience, the mentorship programs, the clear governance - these are what sustain the project.

## The Personal Impact

Beyond technical skills, contributing to open source:

- Built my professional network
- Improved my written communication
- Taught me patience and persistence
- Gave me confidence in large codebases

If you're considering contributing to open source, my advice: pick a project you use, start with small contributions (docs, tests, bug fixes), and be patient. The learning compounds over time.
