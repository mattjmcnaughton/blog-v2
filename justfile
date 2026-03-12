image := "mattjmcnaughton.io/blog:latest"

# Install dependencies (skipping lifecycle scripts)
install:
    pnpm install --ignore-scripts

# Run the dev server locally
# Using --webpack due to recurring Turbopack panics in Next.js 16.1.6
# ("Failed to write app endpoint /page"). Revisit after upgrading Next.js.
dev:
    pnpm dev --webpack

# Run linter
lint:
    pnpm lint

# Run format check
format-check:
    pnpm format:check

# Run e2e tests
test-e2e:
    pnpm test:e2e

# Run mobile layout tests only
test-mobile:
    pnpm exec playwright test --project=mobile

# Run all quality checks (lint, format, e2e tests)
gate: lint format-check test-e2e

# Build the Docker image
build: docker-build

# Build the Docker image
docker-build:
    docker build -t {{image}} .

# Run the Docker container
run: docker-run

# Run the Docker container
docker-run: docker-build
    docker run -p 3000:3000 {{image}}

# Launch app on fly.io (first time only)
launch: build
    fly launch

# Deploy to fly.io
deploy:
    fly deploy

# Add SSL certificates for custom domains
certs:
    fly certs add mattjmcnaughton.com
    fly certs add www.mattjmcnaughton.com
    fly certs add blog.mattjmcnaughton.com

# Check certificate status
certs-check:
    fly certs list

# Start the local observability stack (Tempo + Prometheus + Grafana)
obs-up:
    docker compose up -d

# Stop the local observability stack
obs-down:
    docker compose down

# Start obs stack + dev server with instrumentation enabled
dev-instrumented: obs-up
    OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 pnpm dev --webpack
