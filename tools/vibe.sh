#!/bin/bash
#
# Runs vibe withing a docker container.  The container's image is expected
# to have been created with the Dockerfile.vibe in the root directory.
#
# To temporarily run a shell instead of the vibe CLI tool, run this script
# as follows: ./tools/vibe.sh --entrypoint bash

if command -v podman >/dev/null 2>&1; then
  CONTAINER_CMD="podman"
elif command -v docker >/dev/null 2>&1; then
  CONTAINER_CMD="docker"
else
  echo "Error: Neither podman nor docker is installed." >&2
  exit 1
fi

"$CONTAINER_CMD" run -it --rm \
  -e MISTRAL_API_KEY="$MISTRAL_API_KEY" \
  -v "$(pwd)":/workspace:Z \
  -v "$NVM_DIR":/root/.nvm:ro \
  "$@" \
  mistral-vibe-sandbox

