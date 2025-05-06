#!/bin/bash

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "Error: Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to clean up existing containers
cleanup() {
    echo "Cleaning up existing containers..."
    docker stop stockfish-server 2>/dev/null || true
    docker rm stockfish-server 2>/dev/null || true
    docker rmi ivangabriele/dockfish:15 2>/dev/null || true
}

# Check if Docker is running
check_docker

# Clean up existing containers
cleanup

# Pull the Dockfish image
echo "Pulling Dockfish image..."
docker pull ivangabriele/dockfish:15

# Run the Stockfish container
echo "Starting Stockfish server..."
docker run -d \
    --name stockfish-server \
    -p 8080:8080 \
    -e PORT=8080 \
    ivangabriele/dockfish:15

# Wait for the container to start
echo "Waiting for container to start..."
sleep 2

# Show container logs
echo "Container logs:"
docker logs stockfish-server

echo "Stockfish server is running!"
echo "You can test it by visiting: http://localhost:8080/check" 