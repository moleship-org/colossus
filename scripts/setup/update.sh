#!/usr/bin/env bash
# Pulls the latest Colossus image and restarts the service.
#
# Runs rootless (as the current user, no sudo needed) by default. Pass
# --rootful (with sudo) to manage the root-owned system-wide service
# instead. This must match how Colossus was installed.
#
# Usage:
#   ./update.sh                 # rootless (default)
#   sudo ./update.sh --rootful  # rootful

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
  require_podman_systemd

  unit_exists || die "Colossus does not appear to be installed (${COLOSSUS_UNIT_FILE} not found). Run install.sh first."

  log_info "Pulling latest image ${COLOSSUS_IMAGE}"
  podman pull "$COLOSSUS_IMAGE"

  log_info "Reloading systemd units"
  "${SYSTEMCTL[@]}" daemon-reload

  log_info "Restarting ${COLOSSUS_SERVICE}"
  "${SYSTEMCTL[@]}" restart "$COLOSSUS_SERVICE"

  log_success "Colossus has been updated (${COLOSSUS_MODE} mode)."
  log_info "Check its status with: ${SYSTEMCTL[*]} status ${COLOSSUS_SERVICE}"
}

main "$@"
