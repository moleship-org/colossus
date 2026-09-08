#!/usr/bin/env bash
# common utilities for setup
#
# Meant to be sourced, not executed directly:
#   . "$(dirname "$0")/lib.sh"
# shellcheck disable=SC2034 # some variables here are used by scripts that source this file

# Guard against being sourced twice.
if [ -n "${COLOSSUS_LIB_SOURCED:-}" ]; then
  return 0 2>/dev/null || exit 0
fi
COLOSSUS_LIB_SOURCED=1

set -euo pipefail

# --- mode --------------------------------------------------------------------
#
# Colossus can be managed as either:
#   - "rootless" (default): a per-user Podman/systemd service, no sudo needed.
#   - "rootful": a root-owned system-wide service under /etc.
#
# Callers select the mode by setting COLOSSUS_MODE=rootful|rootless before
# sourcing this file (install.sh/update.sh/uninstall.sh do this based on a
# --rootful/--rootless flag).

COLOSSUS_MODE="${COLOSSUS_MODE:-rootless}"

case "$COLOSSUS_MODE" in
  rootless | rootful) ;;
  *) echo "[fail] Invalid COLOSSUS_MODE '${COLOSSUS_MODE}' (expected 'rootless' or 'rootful')." >&2; exit 1 ;;
esac

# --- configuration ---------------------------------------------------------

COLOSSUS_REPO="${COLOSSUS_REPO:-moleship-org/colossus}"
COLOSSUS_BRANCH="${COLOSSUS_BRANCH:-main}"
COLOSSUS_RAW_BASE="${COLOSSUS_RAW_BASE:-https://raw.githubusercontent.com/${COLOSSUS_REPO}/${COLOSSUS_BRANCH}}"
COLOSSUS_IMAGE="${COLOSSUS_IMAGE:-ghcr.io/moleship-org/colossus:latest}"

# Repository root and Containerfile path, resolved from this file's own
# location rather than the caller's, so build/publish tooling works
# regardless of how it was invoked.
COLOSSUS_LIB_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
ROOT_DIR="$(cd -- "${COLOSSUS_LIB_DIR}/../.." >/dev/null 2>&1 && pwd)"
CONTAINERFILE="${ROOT_DIR}/containers/Containerfile"

COLOSSUS_UNIT_NAME="colossus"
COLOSSUS_SERVICE="${COLOSSUS_UNIT_NAME}.service"

if [ "$COLOSSUS_MODE" = "rootful" ]; then
  COLOSSUS_UNIT_DIR="/etc/containers/systemd"
  COLOSSUS_CONFIG_DIR="/etc/colossus"
  COLOSSUS_SOURCE_UNIT_NAME="colossus-rootful.container"
  SYSTEMCTL=(systemctl)
  JOURNALCTL=(journalctl)
else
  # Matches the %h/.config paths hardcoded in colossus-rootless.container -
  # systemd's %h specifier always resolves to $HOME, regardless of
  # XDG_CONFIG_HOME, so we mirror that here rather than honoring it.
  COLOSSUS_UNIT_DIR="${HOME}/.config/containers/systemd"
  COLOSSUS_CONFIG_DIR="${HOME}/.config/colossus"
  COLOSSUS_SOURCE_UNIT_NAME="colossus-rootless.container"
  SYSTEMCTL=(systemctl --user)
  JOURNALCTL=(journalctl --user)
fi

COLOSSUS_UNIT_FILE="${COLOSSUS_UNIT_DIR}/${COLOSSUS_UNIT_NAME}.container"
COLOSSUS_ENV_FILE="${COLOSSUS_CONFIG_DIR}/colossus.env"

# --- output helpers ----------------------------------------------------------

if [ -t 1 ]; then
  C_RESET=$'\033[0m'
  C_RED=$'\033[31m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_BLUE=$'\033[34m'
else
  C_RESET=""
  C_RED=""
  C_GREEN=""
  C_YELLOW=""
  C_BLUE=""
fi

log_info()    { printf '%s[info]%s %s\n'  "$C_BLUE"   "$C_RESET" "$*"; }
log_success() { printf '%s[ ok ]%s %s\n'  "$C_GREEN"  "$C_RESET" "$*"; }
log_warn()    { printf '%s[warn]%s %s\n'  "$C_YELLOW" "$C_RESET" "$*" >&2; }
log_error()   { printf '%s[fail]%s %s\n'  "$C_RED"    "$C_RESET" "$*" >&2; }

# Generic-purpose logger, for scripts (like publish.sh) that aren't tied to
# the install/update/uninstall mode-specific log_* helpers above.
log() { log_info "$@"; }

die() {
  log_error "$*"
  exit 1
}

# --- checks ------------------------------------------------------------------

# Verifies the current user is appropriate for the selected COLOSSUS_MODE:
# root for "rootful", a regular user for "rootless".
require_privileges() {
  if [ "$COLOSSUS_MODE" = "rootful" ]; then
    if [ "$(id -u)" -ne 0 ]; then
      die "Rootful mode requires root privileges. Re-run with sudo, or drop --rootful to use rootless mode (the default, no sudo needed)."
    fi
  else
    if [ "$(id -u)" -eq 0 ]; then
      die "Rootless mode should not be run as root. Re-run as a regular user, or pass --rootful (with sudo) for a system-wide install."
    fi
  fi
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Required command '$1' was not found in PATH."
}

require_podman_systemd() {
  require_cmd podman
  require_cmd systemctl

  if ! podman info >/dev/null 2>&1; then
    die "Podman is installed but not usable. Check your Podman setup."
  fi

  if [ "$COLOSSUS_MODE" = "rootful" ]; then
    if [ ! -d /run/systemd/system ]; then
      die "systemd does not appear to be running (not PID 1 / no /run/systemd/system)."
    fi
  else
    if ! systemctl --user show-environment >/dev/null 2>&1; then
      die "Could not reach your user systemd instance. Make sure you're in a normal login session and systemd --user is running."
    fi
  fi
}

# Warns (but does not fail) if the current user does not have lingering
# enabled, since that's needed for a rootless service to survive logout and
# start on boot.
warn_if_lingering_disabled() {
  [ "$COLOSSUS_MODE" = "rootless" ] || return 0
  command -v loginctl >/dev/null 2>&1 || return 0

  if ! loginctl show-user "$(id -un)" -p Linger 2>/dev/null | grep -q '^Linger=yes$'; then
    log_warn "Lingering is not enabled for $(id -un): Colossus will stop when you log out."
    log_warn "Enable it with: sudo loginctl enable-linger $(id -un)"
  fi
}

# --- state ---------------------------------------------------------------

unit_exists() {
  [ -f "$COLOSSUS_UNIT_FILE" ]
}

# --- misc helpers ----------------------------------------------------------

confirm() {
  prompt="${1:-Are you sure?}"
  reply=""

  read -r -p "$prompt [y/N] " reply || true
  case "$reply" in
    [yY][eE][sS] | [yY]) return 0 ;;
    *) return 1 ;;
  esac
}

# Downloads a file from the Colossus repository (raw.githubusercontent.com)
# into the given destination path. Used as a fallback when this script is
# run standalone (e.g. piped from curl) without a local checkout.
fetch_remote_file() {
  rel_path="$1"
  dest="$2"

  require_cmd curl

  url="${COLOSSUS_RAW_BASE}/${rel_path}"
  log_info "Downloading ${url}"
  curl -fsSL "$url" -o "$dest"
}

# The default image reference used by publish.sh (and anything else that
# needs a sensible fallback tag).
default_image_tag() {
  printf '%s\n' "$COLOSSUS_IMAGE"
}
