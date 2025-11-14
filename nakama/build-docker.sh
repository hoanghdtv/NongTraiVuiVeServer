#!/bin/bash

# Build and test script for Nakama with Rollup
set -e

echo "🔄 Building Nakama with Rollup Docker image..."

# Build the Docker image
docker build -t nakama-rollup:latest .

echo "✅ Docker image built successfully!"

# Optional: Test the image
echo "🧪 Testing the Docker image..."

# Run container in detached mode
CONTAINER_ID=$(docker run -d -p 7349:7349 -p 7350:7350 -p 7351:7351 nakama-rollup:latest)

echo "📦 Container started with ID: $CONTAINER_ID"

# Wait for Nakama to start
echo "⏳ Waiting for Nakama to start..."
sleep 10

# Check if container is running
if docker ps | grep $CONTAINER_ID > /dev/null; then
  echo "✅ Container is running successfully!"
  
  # Test health check
  if docker exec $CONTAINER_ID /nakama/nakama healthcheck > /dev/null 2>&1; then
    echo "✅ Health check passed!"
  else
    echo "⚠️  Health check failed"
  fi
  
  # Show logs
  echo "📋 Container logs:"
  docker logs $CONTAINER_ID | tail -20
else
  echo "❌ Container failed to start"
  docker logs $CONTAINER_ID
  exit 1
fi

# Cleanup
echo "🧹 Cleaning up test container..."
docker stop $CONTAINER_ID > /dev/null
docker rm $CONTAINER_ID > /dev/null

echo "🎉 Build and test completed successfully!"
echo ""
echo "To run the container:"
echo "docker run -p 7349:7349 -p 7350:7350 -p 7351:7351 nakama-rollup:latest"