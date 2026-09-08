#!/usr/bin/env bash
# Build Colossus image locally

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
