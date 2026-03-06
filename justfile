image := "mattjmcnaughton.io/blog:latest"

# Run the dev server locally
# Using --webpack due to recurring Turbopack panics in Next.js 16.1.6
# ("Failed to write app endpoint /page"). Revisit after upgrading Next.js.
dev:
    pnpm dev --webpack

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
