#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

log() {
    local level="$1"
    shift
    local timestamp="$(date +"%Y-%m-%d %H:%M:%S")"

    if [[ "$level" == "ERROR" ]]; then
        echo "$timestamp [$level] $*" >&2
    else
        echo "$timestamp [$level] $*"
    fi
}

log_info()  { log "INFO" "$@"; }
log_warn()  { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }

trap 'log_error "Script failed"; exit 1' ERR

check_root() {
    if [[ "$(id -u)" -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
    log_info "Running with root privileges"
}

check_incus_installed() {
    if command -v incus >/dev/null 2>&1; then
        log_info "incus is already installed"
        return 0
    fi
    return 1
}

install_incus() {
    # Installed via the Zabbly repo (https://github.com/zabbly/incus),
    # Incus LTS 7.0.
    #
    # Note: Do not install `incus-tools` separately -- the Ubuntu repo version
    # conflicts with Zabbly's `incus-base`. The `incus` package from Zabbly
    # includes everything needed.
    log_info "Creating apt keyrings directory"
    mkdir -p /etc/apt/keyrings

    log_info "Downloading Zabbly GPG key"
    curl -fsSL https://pkgs.zabbly.com/key.asc -o /etc/apt/keyrings/zabbly.asc

    # Remove any stale sources file from an older Zabbly channel (e.g. a prior
    # lts-6.0 install), which would otherwise break `apt update` if that channel
    # lacks builds for this Ubuntu release.
    log_info "Removing any stale Zabbly Incus lts-6.0 repository"
    rm -f /etc/apt/sources.list.d/zabbly-incus-lts-6.0.sources

    log_info "Adding Zabbly Incus LTS 7.0 repository"
    cat > /etc/apt/sources.list.d/zabbly-incus-lts-7.0.sources <<EOF
Enabled: yes
Types: deb
URIs: https://pkgs.zabbly.com/incus/lts-7.0
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: main
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/zabbly.asc
EOF

    log_info "Updating package database"
    apt update

    log_info "Installing incus package"
    apt install -y incus

    # Add the current user to the incus-admin group if we're running with sudo
    if [[ -n "${SUDO_USER:-}" ]]; then
        log_info "Adding user $SUDO_USER to the incus-admin group"
        usermod -aG incus-admin "$SUDO_USER"
        log_info "Note: The user will need to log out and back in for group changes to take effect"
    else
        log_warn "Could not determine non-root user to add to incus-admin group"
        log_warn "Remember to add your user to the incus-admin group with: usermod -aG incus-admin <username>"
    fi

    log_info "Initializing incus with minimal defaults"
    incus admin init --minimal

    log_info "incus installation completed successfully"
}

main() {
    log_info "Starting incus installation script for Ubuntu"

    check_root

    if check_incus_installed; then
        log_info "incus is already properly installed, nothing to do"
        exit 0
    fi

    install_incus

    log_info "incus has been successfully installed"
}

main "$@"
