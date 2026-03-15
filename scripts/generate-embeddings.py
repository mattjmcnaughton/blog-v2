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

Outputs public/embeddings.json with L2-normalized chunk embeddings for each post.
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

MAX_CHUNK_WORDS = 200
OVERLAP_WORDS = 50


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split YAML frontmatter from markdown body."""
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)", text, re.DOTALL)
    if not match:
        return {}, text
    meta = yaml.safe_load(match.group(1)) or {}
    body = match.group(2)
    return meta, body


def strip_markdown_noise(text: str) -> str:
    """Remove footnote definitions and HTML tags."""
    text = re.sub(r"^\[\^\w+\]:.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"<[^>]+>", "", text)
    return text


def split_paragraphs_with_overlap(text: str, max_words: int, overlap_words: int) -> list[str]:
    """Split text on paragraph boundaries with word-level overlap."""
    paragraphs = text.split("\n\n")
    chunks: list[str] = []
    current_words: list[str] = []

    for para in paragraphs:
        para_words = para.split()
        if not para_words:
            continue

        if current_words and len(current_words) + len(para_words) > max_words:
            chunks.append(" ".join(current_words))
            # Keep last overlap_words for context
            current_words = current_words[-overlap_words:] if overlap_words else []

        current_words.extend(para_words)

    if current_words:
        chunks.append(" ".join(current_words))

    return chunks


def chunk_markdown(title: str, description: str, body: str) -> list[str]:
    """Split a blog post into chunks for embedding.

    Splits on ## headers, with paragraph-level sub-splitting for long sections.
    Prepends title to each chunk for context.
    """
    body = strip_markdown_noise(body)

    # Split on H2 headers
    sections = re.split(r"\n(?=## )", body)

    # If the entire post is short, return as single chunk
    total_words = len(body.split())
    if total_words <= MAX_CHUNK_WORDS:
        return [f"{title}\n{description}\n{body}".strip()]

    chunks: list[str] = []
    for i, section in enumerate(sections):
        section = section.strip()
        if not section:
            continue

        # First chunk gets description for context
        if i == 0:
            prefix = f"{title}\n{description}\n"
        else:
            prefix = f"{title}\n"

        section_words = len(section.split())
        if section_words <= MAX_CHUNK_WORDS:
            chunks.append(f"{prefix}{section}".strip())
        else:
            # Sub-split long sections on paragraph boundaries
            sub_chunks = split_paragraphs_with_overlap(
                section, MAX_CHUNK_WORDS, OVERLAP_WORDS
            )
            for sub in sub_chunks:
                chunks.append(f"{prefix}{sub}".strip())

    return chunks if chunks else [f"{title}\n{description}\n{body}".strip()]


def main() -> None:
    md_files = sorted(glob.glob(os.path.join(CONTENT_DIR, "*.md")))
    slugs: list[str] = []
    all_chunks: list[str] = []
    chunk_ranges: list[tuple[int, int]] = []  # (start, end) indices per slug

    for filepath in md_files:
        with open(filepath) as f:
            content = f.read()
        meta, body = parse_frontmatter(content)

        if meta.get("draft"):
            continue

        slug = os.path.splitext(os.path.basename(filepath))[0]
        title = meta.get("title", "")
        description = meta.get("description", "")

        chunks = chunk_markdown(title, description, body)
        start = len(all_chunks)
        all_chunks.extend(chunks)
        end = len(all_chunks)

        slugs.append(slug)
        chunk_ranges.append((start, end))
        print(f"  {slug}: {len(chunks)} chunk(s)")

    print(f"Found {len(slugs)} posts, {len(all_chunks)} total chunks to embed")

    if torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"
    print(f"Using device: {device}")

    model = SentenceTransformer(f"sentence-transformers/{MODEL_NAME}", device=device)
    embeddings = model.encode(all_chunks, normalize_embeddings=True, show_progress_bar=True)

    posts: dict[str, dict] = {}
    for slug, (start, end) in zip(slugs, chunk_ranges):
        chunk_embeddings = [
            [round(float(v), 6) for v in embeddings[i]] for i in range(start, end)
        ]
        posts[slug] = {"chunks": chunk_embeddings}

    output = {
        "model": MODEL_NAME,
        "dimension": model.get_sentence_embedding_dimension(),
        "version": 2,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "posts": posts,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f)

    file_size = os.path.getsize(OUTPUT_PATH)
    print(f"Wrote {OUTPUT_PATH} ({file_size:,} bytes, {len(posts)} posts)")


if __name__ == "__main__":
    main()
