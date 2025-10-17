#!/usr/bin/env bash
set -euo pipefail

# Usage: GHCR_USER=me GHCR_TOKEN=tok ./build-and-push-kas.sh [image]
IMAGE=${1:-}

if [ -z "${GHCR_USER:-}" ] || [ -z "${GHCR_TOKEN:-}" ]; then
  echo "Please set GHCR_USER and GHCR_TOKEN environment variables with your GHCR credentials"
  exit 1
fi

if [ -z "$IMAGE" ]; then
  IMAGE="ghcr.io/${GHCR_USER}/kas:latest"
fi

echo "Building image $IMAGE"
docker build -t "$IMAGE" -f ../Dockerfile .

echo "Logging in to GHCR"
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

echo "Pushing $IMAGE"
docker push "$IMAGE"

echo "Done."
