# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "sentence-transformers>=3.0",
#     "torch>=2.0",
#     "pyyaml>=6.0",
# ]
# ///
"""Generate embeddings for blog posts using sentence-transformers.

Usage:
    uv run scripts/generate-embeddings.py

Outputs public/embeddings.json with L2-normalized embeddings for each post.
"""

import glob
import json
import os
import re
from datetime import datetime, timezone

import torch
import yaml
from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"
CONTENT_DIR = os.path.join(os.path.dirname(__file__), "..", "content", "blog")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "embeddings.json")


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split YAML frontmatter from markdown body."""
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)", text, re.DOTALL)
    if not match:
        return {}, text
    meta = yaml.safe_load(match.group(1)) or {}
    body = match.group(2)
    return meta, body


def main() -> None:
    md_files = sorted(glob.glob(os.path.join(CONTENT_DIR, "*.md")))
    slugs: list[str] = []
    texts: list[str] = []

    for filepath in md_files:
        with open(filepath) as f:
            content = f.read()
        meta, body = parse_frontmatter(content)

        if meta.get("draft"):
            continue

        slug = os.path.splitext(os.path.basename(filepath))[0]
        title = meta.get("title", "")
        description = meta.get("description", "")
        text = f"{title}\n{description}\n{body}"

        slugs.append(slug)
        texts.append(text)

    print(f"Found {len(slugs)} posts to embed")

    if torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"
    print(f"Using device: {device}")

    model = SentenceTransformer(f"sentence-transformers/{MODEL_NAME}", device=device)
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=True)

    posts: dict[str, list[float]] = {}
    for slug, embedding in zip(slugs, embeddings):
        posts[slug] = [round(float(v), 6) for v in embedding]

    output = {
        "model": MODEL_NAME,
        "dimension": model.get_sentence_embedding_dimension(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "posts": posts,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f)

    file_size = os.path.getsize(OUTPUT_PATH)
    print(f"Wrote {OUTPUT_PATH} ({file_size:,} bytes, {len(posts)} posts)")


if __name__ == "__main__":
    main()
