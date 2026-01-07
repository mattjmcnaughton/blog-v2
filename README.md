# blog-v2

A modern personal blog and portfolio website built with Next.js, React, and Tailwind CSS.

## Features

- **Blog System** - Markdown-based posts with YAML frontmatter, syntax highlighting, and tag support
- **RSS Feed** - Standards-compliant RSS 2.0 feed for subscribers
- **Dark Mode** - System preference detection with localStorage persistence
- **Responsive Design** - Mobile-first layout that works across all devices
- **Content Pages** - About, Now (nownownow.com format), and Projects sections
- **SEO Optimized** - Next.js metadata API for search engine visibility

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **UI:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with Typography plugin
- **Content:** Markdown with [gray-matter](https://github.com/jonschlinkert/gray-matter) and [unified](https://unifiedjs.com/) ecosystem
- **Code Highlighting:** [rehype-highlight](https://github.com/rehypejs/rehype-highlight)

## Getting Started

### Prerequisites

- [Node.js 20](https://nodejs.org/) or later
- [pnpm](https://pnpm.io/) package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/mattjmcnaughton/blog-v2.git
cd blog-v2

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions (markdown processing)
- `content/` - Markdown content files (blog posts and pages)
- `public/` - Static assets

## Content Management

### Adding a Blog Post

Create a new `.md` file in `content/blog/` with YAML frontmatter:

```markdown
---
title: "Your Post Title"
date: "2025-01-06"
description: "A brief description for previews and SEO"
tags: ["tag1", "tag2"]
featured: true # Optional: show on homepage
draft: false # Optional: hide from public
---

Your markdown content here...
```

### Editing Pages

- **About:** Edit `content/about.md`
- **Now:** Edit `content/now.md`
- **Projects:** Edit `content/projects.md`

## Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting without changes
```

### Code Quality

This project uses:

- **ESLint** - Code linting with Next.js and TypeScript rules
- **Prettier** - Code formatting
- **Pre-commit hooks** - Automated checks before each commit

## Deployment

### Docker

Build and run with Docker:

```bash
# Build the image
docker build -t blog-v2 .

# Run the container
docker run -p 3000:3000 blog-v2
```

Or use the justfile:

```bash
just build   # Build Docker image
just run     # Run container
```

### Production Build

The project uses Next.js standalone output mode, optimized for containerized deployments:

```bash
pnpm build
```

The standalone build is output to `.next/standalone/`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
