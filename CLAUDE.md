# CLAUDE.md

## Project overview

Personal blog for mattjmcnaughton.com. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Deployed to Fly.io via Docker (standalone output).

## Tech stack

- **Framework:** Next.js 16 (App Router) with `output: "standalone"`
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 with `@tailwindcss/typography`
- **Markdown:** unified/remark/rehype pipeline with syntax highlighting (`rehype-highlight`)
- **Package manager:** pnpm (with `pnpm-workspace.yaml`)
- **Linting:** ESLint 9 (flat config) + eslint-config-next + eslint-config-prettier
- **Formatting:** Prettier
- **Deployment:** Fly.io, CI via GitHub Actions (`.github/workflows/ci.yml`, `.github/workflows/fly-deploy.yml`)
- **Task runner:** just (`justfile`)

## Project structure

```
src/
  app/             # Next.js App Router pages
    page.tsx       # Homepage
    layout.tsx     # Root layout
    globals.css    # Global styles (Tailwind)
    blog/          # Blog listing + [slug] dynamic route
    about/         # About page
    now/           # Now page
    feed/          # RSS feed (route handler)
  components/      # Shared React components
  lib/             # Utilities (markdown processing)
content/           # Markdown content (blog posts, about, now, projects)
docs/              # Project documentation (deployment, security)
public/            # Static assets
```

## Common commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting

pnpm test:e2e         # Run Playwright e2e tests

just dev              # Alias for pnpm dev
just build            # Docker build
just run              # Docker build + run on :3000
just deploy           # Deploy to Fly.io
just lint             # Run ESLint
just format-check     # Check formatting
just test-e2e         # Run Playwright e2e tests
just gate             # Run all quality checks (lint, format, e2e)
```

## Code conventions

- Path alias: `@/*` maps to `./src/*`
- Blog posts live in `content/blog/` as Markdown with YAML frontmatter
- Components are PascalCase `.tsx` files in `src/components/`
- ESLint flat config in `eslint.config.mjs` (core-web-vitals + typescript + prettier)
- Security headers configured in `next.config.ts` (CSP, HSTS, etc.)

## Before committing

1. `pnpm lint` -- must pass with no errors
2. `pnpm format:check` -- must pass (run `pnpm format` to fix)
3. `pnpm build` -- must succeed
4. `pnpm test:e2e` -- all e2e tests must pass

Or run `just gate` to execute lint, format check, and e2e tests in one command.

## Testing

- E2E tests use Playwright (Chromium only), test files live in `e2e/`
- Tests auto-start the dev server via `webServer` config
- Run `pnpm test:e2e` to execute
- Core workflows documented in `docs/product/workflows.md`
