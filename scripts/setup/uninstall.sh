#!/usr/bin/env bash
# Stops and removes the Colossus systemd service, and optionally its
# configuration and local image.
#
# Runs rootless (as the current user, no sudo needed) by default. Pass
# --rootful (with sudo) to remove the root-owned system-wide service
# instead. This must match how Colossus was installed.
#
# Usage:
#   ./uninstall.sh                 # rootless (default)
#   sudo ./uninstall.sh --rootful  # rootful

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

for arg in "$@"; do
  case "$arg" in
    --rootful) COLOSSUS_MODE="rootful" ;;
    --rootless) COLOSSUS_MODE="rootless" ;;
    *)
      echo "Usage: $0 [--rootful|--rootless]" >&2
      exit 1
      ;;
  esac
done
COLOSSUS_MODE="${COLOSSUS_MODE:-rootless}"

# shellcheck source=./lib.sh
. "${SCRIPT_DIR}/lib.sh"

main() {
  require_privileges
  require_cmd systemctl

  if ! unit_exists; then
    log_warn "Colossus does not appear to be installed (${COLOSSUS_UNIT_FILE} not found)."
    exit 0
  fi

  confirm "Stop and remove the Colossus service (${COLOSSUS_MODE} mode)?" || {
    log_info "Aborted."
    exit 0
  }

  # Quadlet services are generated/transient units, so "systemctl disable"
  # is not a valid operation on them - stopping and removing the unit file
  # (below) is what prevents it from starting again on the next boot.
  log_info "Stopping ${COLOSSUS_SERVICE}"
  "${SYSTEMCTL[@]}" stop "$COLOSSUS_SERVICE" 2>/dev/null || true

  log_info "Removing unit file ${COLOSSUS_UNIT_FILE}"
  rm -f "$COLOSSUS_UNIT_FILE"

  "${SYSTEMCTL[@]}" daemon-reload
  "${SYSTEMCTL[@]}" reset-failed "$COLOSSUS_SERVICE" 2>/dev/null || true

  if [ -d "$COLOSSUS_CONFIG_DIR" ] && confirm "Also remove the configuration directory ${COLOSSUS_CONFIG_DIR}?"; then
    rm -rf "$COLOSSUS_CONFIG_DIR"
    log_info "Removed ${COLOSSUS_CONFIG_DIR}"
  fi

  if command -v podman >/dev/null 2>&1 && confirm "Also remove the local Colossus image (${COLOSSUS_IMAGE})?"; then
    podman rmi "$COLOSSUS_IMAGE" 2>/dev/null || log_warn "Could not remove the image (it may be in use or already removed)."
  fi

  log_success "Colossus has been uninstalled."
}

main "$@"
