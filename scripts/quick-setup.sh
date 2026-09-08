#!/usr/bin/env bash
# Colossus quick setup.
#
# Runs install, update or uninstall for Colossus's Podman Quadlet service.
# Works both from a local checkout and as a one-liner piped from curl.
#
# By default this manages Colossus as a rootless (per-user) Podman/systemd
# service - no sudo required. Pass --rootful to manage it as a root-owned,
# system-wide service instead (needs sudo).
#
# Usage:
#   ./quick-setup.sh [install|update|uninstall] [--rootful|--rootless]
#
#   curl -fsSL https://raw.githubusercontent.com/moleship-org/colossus/main/scripts/quick-setup.sh \
#     | bash -s -- install
#
#   curl -fsSL https://raw.githubusercontent.com/moleship-org/colossus/main/scripts/quick-setup.sh \
#     | sudo bash -s -- install --rootful

set -euo pipefail

usage() {
  echo "Usage: $0 [install|update|uninstall|publish] [--rootful|--rootless]" >&2
  exit 1
}

ACTION="install"
FORWARD_ARGS=()

for arg in "$@"; do
  case "$arg" in
    install | update | uninstall | publish) ACTION="$arg" ;;
    --rootful | --rootless) FORWARD_ARGS+=("$arg") ;;
    *) usage ;;
  esac
done

COLOSSUS_REPO="${COLOSSUS_REPO:-moleship-org/colossus}"
COLOSSUS_BRANCH="${COLOSSUS_BRANCH:-main}"
COLOSSUS_RAW_BASE="${COLOSSUS_RAW_BASE:-https://raw.githubusercontent.com/${COLOSSUS_REPO}/${COLOSSUS_BRANCH}}"

# Resolve this script's own directory, when run from a local checkout.
SCRIPT_SOURCE="${BASH_SOURCE[0]:-$0}"
SETUP_DIR=""
if [ -e "$SCRIPT_SOURCE" ]; then
  SCRIPT_DIR="$(cd -- "$(dirname -- "$SCRIPT_SOURCE")" >/dev/null 2>&1 && pwd)"
  SETUP_DIR="${SCRIPT_DIR}/setup"
fi

if [ -n "$SETUP_DIR" ] && [ -f "${SETUP_DIR}/lib.sh" ]; then
  # Local checkout: use the scripts next to this one.
  RUN_DIR="$SETUP_DIR"
else
  # Standalone (e.g. piped from curl): fetch the setup scripts to a temp dir.
  command -v curl >/dev/null 2>&1 || {
    echo "curl is required to fetch the setup scripts." >&2
    exit 1
  }

  RUN_DIR="$(mktemp -d)"
  trap 'rm -rf "$RUN_DIR"' EXIT

  for file in lib.sh install.sh update.sh uninstall.sh publish.sh; do
    curl -fsSL "${COLOSSUS_RAW_BASE}/scripts/setup/${file}" -o "${RUN_DIR}/${file}"
  done
  chmod +x "${RUN_DIR}"/*.sh
fi

if [ "${#FORWARD_ARGS[@]}" -gt 0 ]; then
  exec bash "${RUN_DIR}/${ACTION}.sh" "${FORWARD_ARGS[@]}"
else
  exec bash "${RUN_DIR}/${ACTION}.sh"
fi
