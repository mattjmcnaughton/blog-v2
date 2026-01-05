image := "mattjmcnaughton.io/blog:latest"

# Build the Docker image
build: docker-build

# Build the Docker image
docker-build:
    docker build -t {{image}} .

# Run the Docker container
run: docker-run

# Run the Docker container
docker-run:
    docker run -p 3000:3000 {{image}}
