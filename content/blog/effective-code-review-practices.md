---
title: "Effective Code Review Practices"
date: "2022-02-14"
description: "Patterns for code reviews that improve code quality while maintaining team velocity and morale."
tags: ["engineering", "code-review", "team", "best-practices"]
---

After years of both giving and receiving code reviews - including reviewing PRs for Kubernetes - I've developed a set of practices that I believe lead to better outcomes for everyone involved.

## Review the Right Things

Not everything deserves equal scrutiny. I prioritize:

**High priority:**

- Logic correctness - Does this do what it's supposed to?
- Security implications - Are there injection risks, auth bypasses?
- Performance impacts - Will this scale?
- API design - Is this interface something we want to maintain forever?

**Lower priority:**

- Style nitpicks (automate these with linters)
- Variable naming (unless truly confusing)
- Minor refactoring opportunities

```python
# I wouldn't block a PR on this
user_list = get_users()  # Could be named "users" but it's fine

# I WOULD block on this
def delete_user(user_id):
    # Missing authorization check!
    db.execute(f"DELETE FROM users WHERE id = {user_id}")  # SQL injection!
```

## Frame Feedback Constructively

Compare these two approaches:

**Less effective:**

> "This is wrong. You should use a map instead of a list."

**More effective:**

> "Have you considered using a map here? It would give us O(1) lookups instead of O(n), which matters since this runs in a hot path. Happy to discuss if you see downsides I'm missing!"

The second approach:

- Explains _why_
- Acknowledges you might be wrong
- Opens dialogue rather than dictating

## Use Conventional Comments

We adopted a system of prefixes that clarify intent:

```
**suggestion:** Consider extracting this into a helper function.
(Take it or leave it, won't block the PR)

**question:** Why did we choose to do it this way?
(Genuinely curious, might learn something)

**issue:** This will fail if the list is empty.
(Must be addressed before merge)

**nit:** Typo in comment: "recieve" -> "receive"
(Trivial, fix if convenient)
```

## Size Matters

The most actionable advice: **keep PRs small**. Our data showed:

| PR Size (lines) | Review Time | Defect Rate |
| --------------- | ----------- | ----------- |
| < 200           | 30 min      | 2%          |
| 200-500         | 2 hours     | 5%          |
| > 500           | 4+ hours    | 12%         |

Large PRs get rubber-stamped because reviewer fatigue is real. Break up your work into logical, reviewable chunks.

## Be Human

Remember there's a person on the other end. A quick "nice refactor!" or "learned something new from this" costs nothing and builds trust.
