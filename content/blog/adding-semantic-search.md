---
title: "Adding Semantic Search to This Blog"
date: "2026-03-12T14:00:00"
description: "Client-side semantic search with Transformers.js — no server, no API keys."
tags: ["note", "ai-assisted"]
---

We added semantic search[^1] to the [blog listing page](/blog). You can toggle
between "Keyword" and "Semantic" — keyword does what you'd expect, and semantic
lets you search by meaning. Searching "deploying containers" will find posts
about Docker and Fly.io even if they never use those exact words.

## How it works

A Python
[script](https://github.com/mattjmcnaughton/blog-v2/blob/main/scripts/generate-embeddings.py)
runs offline on my laptop, encodes each post into a 384-dimensional
embedding[^2] using `all-MiniLM-L6-v2`[^3], and writes them all to a static
[JSON file](/embeddings.json). When you click "Semantic" in the browser, it lazy-loads the same model
as an ONNX/WASM[^4] bundle via
[Transformers.js](https://huggingface.co/docs/transformers.js), encodes your
query, and ranks posts by cosine similarity[^5]. No server, no API keys.

We picked `all-MiniLM-L6-v2` because it's small (~23MB), fast enough for
real-time WASM inference, and available in both `sentence-transformers` and
`@huggingface/transformers` — if the offline and online models don't match, the
scores are garbage.

The main annoyances:

- **CSP[^6]** — getting it right was tedious (`wasm-unsafe-eval`, a bunch of Hugging Face CDN domains in `connect-src`, `blob:` workers).
- **~23MB model download** on first use. It caches after that, but the initial load is noticeable.
- **Enter-to-search, not typeahead** — WASM inference takes a few hundred ms per query, so re-ranking on every keystroke would be a mess.
- **Embeddings go stale** if we add a post and forget to re-run the script, so the UI shows when they were last generated.

---

_This post was drafted in collaboration with
[Claude Opus 4.6](https://www.anthropic.com/claude). The semantic search feature
itself was also built with Claude. Attributing when AI is part of the
brainstorming or writing process and tagging those posts w/ `ai-assisted`._

[^1]: Traditional keyword search looks for exact string matches — searching "deploying containers" won't find a post that only says "Docker" or "Fly.io." Semantic search converts your query and each post into numerical vectors that capture meaning, then ranks by how close those vectors are.

[^2]: An embedding is a list of numbers (a vector) that represents the meaning of a piece of text. Similar texts get similar vectors — "deploying a Docker container" and "running an app on Fly.io" end up pointing in roughly the same direction even though they share no words. This model produces 384 numbers per chunk of text.

[^3]: [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) is a sentence embedding model from the sentence-transformers family. It maps text to 384-dimensional vectors optimized for semantic similarity tasks. "MiniLM" refers to the compressed transformer architecture it's based on, and "L6" means it has 6 layers — a good trade-off between quality and speed.

[^4]: ONNX (Open Neural Network Exchange) is a standard format for ML models — train in PyTorch, run inference somewhere else. WASM (WebAssembly) runs in the browser at near-native speed. Together they let you run an ML model in a web page without a server.

[^5]: Cosine similarity measures the angle between two vectors: same direction = 1.0, perpendicular = 0.0, opposite = -1.0. When vectors are normalized to length 1, the dot product gives you the same answer and is cheaper to compute.

[^6]: Content-Security-Policy (CSP) is an HTTP header that tells the browser what resources a page is allowed to load — scripts, styles, connections, etc. It's a defense against XSS and other injection attacks. The downside is that anything non-standard (like running WASM or fetching ML models from a CDN) needs to be explicitly allowed.
