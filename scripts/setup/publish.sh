#!/usr/bin/env bash
# Build and push the Colossus image to its container registry.
#
# Usage:
#   scripts/setup/publish.sh [--tag <image:tag>] [--version <version>]
#
#   --tag       Primary image reference to build and push.
#               Default: ghcr.io/moleship-org/colossus:latest
#   --version   Also build/push an additional tag for this version
#               (e.g. v1.2.3), and pass it as the VERSION build-arg baked
#               into the image's org.opencontainers.image.version label
#               (see containers/Containerfile).
#
# You must be logged in to the target registry first, e.g.:
#
#   podman login ghcr.io -u <your-github-username>
#
# using a GitHub Personal Access Token with the `write:packages` scope
# (classic) or `packages: write` permission (fine-grained) as the password.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
# shellcheck source=./lib.sh
. "${SCRIPT_DIR}/lib.sh"

TAG="$(default_image_tag)"
VERSION=""

while [ $# -gt 0 ]; do
  case "$1" in
    --tag)
      TAG="$2"
      shift 2
      ;;
    --version)
      VERSION="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

require_cmd podman

BUILD_ARGS=()
if [ -n "$VERSION" ]; then
  BUILD_ARGS+=(--build-arg "VERSION=${VERSION}")
fi

log "Building ${TAG}..."
podman build -f "$CONTAINERFILE" -t "$TAG" "${BUILD_ARGS[@]}" "$ROOT_DIR"

VERSION_TAG=""
if [ -n "$VERSION" ]; then
  VERSION_TAG="${TAG%:*}:${VERSION}"
  log "Tagging ${VERSION_TAG}..."
  podman tag "$TAG" "$VERSION_TAG"
fi

log "Pushing ${TAG}..."
podman push "$TAG"

if [ -n "$VERSION_TAG" ]; then
  log "Pushing ${VERSION_TAG}..."
  podman push "$VERSION_TAG"
fi

log "Published:"
log "  ${TAG}"
if [ -n "$VERSION_TAG" ]; then
  log "  ${VERSION_TAG}"
fi
