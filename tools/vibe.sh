#!/bin/bash
#
# Runs vibe withing a docker container.  The container's image is expected
# to have been created with the Dockerfile.vibe in the root directory.
#
# To temporarily run a shell instead of the vibe CLI tool, run this script
# as follows: ./tools/vibe.sh --entrypoint bash

docker run -it --rm \
  -e MISTRAL_API_KEY="$MISTRAL_API_KEY" \
  -v "$(pwd)":/workspace \
  -v "$NVM_DIR":/root/.nvm:ro \
  $* \
  mistral-vibe-sandbox

