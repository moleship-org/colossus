#!/usr/bin/env bash
# Installs Colossus as a Podman Quadlet systemd service.
#
# Runs rootless (as the current user, no sudo needed) by default. Pass
# --rootful (with sudo) to install as a root-owned system-wide service
# instead.
#
# Usage:
#   ./install.sh                 # rootless (default)
#   sudo ./install.sh --rootful  # rootful
#
# Environment overrides:
#   NUXT_API_BASE   Moleship API base URL (default: http://localhost:5000/api/v1)
#   COLOSSUS_PORT   Port Colossus listens on (default: 3000)
#
# Colossus runs with Network=host (see containers/systemd/colossus-*.container
# for why), so there is no host/container port mapping - COLOSSUS_PORT is
# the actual port it binds to, host-wide.

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

  if unit_exists; then
    log_warn "Colossus already appears to be installed (${COLOSSUS_UNIT_FILE})."
    confirm "Reinstall and overwrite the existing unit?" || {
      log_info "Aborted."
      exit 0
    }
  fi

  api_base="${NUXT_API_BASE:-http://localhost:5000/api/v1}"
  port="${COLOSSUS_PORT:-3000}"

  log_info "Creating configuration directory ${COLOSSUS_CONFIG_DIR}"
  install -d -m 755 "$COLOSSUS_CONFIG_DIR"

  if [ ! -f "$COLOSSUS_ENV_FILE" ]; then
    log_info "Writing environment file ${COLOSSUS_ENV_FILE}"
    cat > "$COLOSSUS_ENV_FILE" <<EOF
# Colossus runtime configuration.
# Changes here take effect after: ${SYSTEMCTL[*]} restart ${COLOSSUS_SERVICE}
NUXT_API_BASE=${api_base}
NITRO_PORT=${port}
EOF
    chmod 640 "$COLOSSUS_ENV_FILE"
  else
    log_info "Keeping existing environment file ${COLOSSUS_ENV_FILE}"
  fi

  log_info "Installing systemd unit ${COLOSSUS_UNIT_FILE} (${COLOSSUS_MODE} mode)"
  install -d -m 755 "$COLOSSUS_UNIT_DIR"

  unit_source="${SCRIPT_DIR}/../../containers/systemd/${COLOSSUS_SOURCE_UNIT_NAME}"
  if [ -f "$unit_source" ]; then
    install -m 644 "$unit_source" "$COLOSSUS_UNIT_FILE"
  else
    tmp_unit="$(mktemp)"
    fetch_remote_file "containers/systemd/${COLOSSUS_SOURCE_UNIT_NAME}" "$tmp_unit"
    install -m 644 "$tmp_unit" "$COLOSSUS_UNIT_FILE"
    rm -f "$tmp_unit"
  fi

  if [ "$port" != "3000" ]; then
    log_info "Configuring Colossus to listen on port ${port}"
    sed -i "s#127.0.0.1:3000#127.0.0.1:${port}#" "$COLOSSUS_UNIT_FILE"
  fi

  log_info "Reloading systemd units"
  "${SYSTEMCTL[@]}" daemon-reload

  # Quadlet applies the unit's [Install] section itself during daemon-reload,
  # so the service is already set up to start on boot. "systemctl enable" is
  # not valid here (generated/transient units cannot be enabled) - just
  # start it now.
  log_info "Starting ${COLOSSUS_SERVICE}"
  "${SYSTEMCTL[@]}" start "$COLOSSUS_SERVICE"

  warn_if_lingering_disabled

  log_success "Colossus is installed and starting on port ${port} (${COLOSSUS_MODE} mode)."
  log_info "Check its status with: ${SYSTEMCTL[*]} status ${COLOSSUS_SERVICE}"
  log_info "Follow its logs with:  ${JOURNALCTL[*]} -u ${COLOSSUS_SERVICE} -f"
}

main "$@"
