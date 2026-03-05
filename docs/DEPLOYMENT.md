# Deployment

This site is deployed to [Fly.io](https://fly.io) as a containerized Next.js standalone server.

## Architecture

All pages are statically pre-rendered at build time via `next build`. The production
container runs the Next.js standalone server (`node server.js`), which serves the
pre-rendered HTML and static assets directly — no nginx or reverse proxy needed.

Fly.io's edge proxy handles SSL termination, HTTP/2, and HTTPS enforcement.

## Custom Domains

The following domains are configured with SSL certificates via Fly.io (Let's Encrypt):

- `mattjmcnaughton.com`
- `www.mattjmcnaughton.com`
- `blog.mattjmcnaughton.com`

## Infrastructure

- **Region:** `ewr` (Newark)
- **VM:** 256MB RAM, 1 shared CPU
- **Auto-scaling:** Machines stop when idle, start on incoming requests
- **Minimum machines:** 0

## Continuous Deployment

Continuous deployment is configured via a GitHub Actions workflow (`.github/workflows/fly-deploy.yml`).
Every push to `main` automatically deploys the application to Fly. This workflow was
auto-configured as part of running `fly launch`.

The `FLY_API_TOKEN` secret must be set in the GitHub repository settings for the workflow to
authenticate with Fly.

## Manual Deploying

```sh
fly deploy
```

Or via just:

```sh
just deploy
```

Every deploy rebuilds the Docker image (multi-stage: install deps, build, copy standalone
output) and rolls out a new machine. Content changes (new posts, updated pages) require a
redeploy since everything is baked in at build time.

## First-Time Setup

1. Install [flyctl](https://fly.io/docs/flyctl/install/)
2. Authenticate: `fly auth login`
3. Launch the app: `fly launch`
4. Add SSL certificates:
   ```sh
   fly certs add mattjmcnaughton.com
   fly certs add www.mattjmcnaughton.com
   fly certs add blog.mattjmcnaughton.com
   ```
5. Configure DNS — managed via [nuage/terraform](https://github.com/mattjmcnaughton/nuage/blob/master/terraform/environments/global/route53.tf). Point each domain to the Fly.io app using the CNAME/A records shown by `fly certs show <domain>`
6. Verify certificates: `fly certs list`
