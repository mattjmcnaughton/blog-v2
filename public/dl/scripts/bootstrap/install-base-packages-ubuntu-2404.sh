#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

log() {
    local level="$1"
    shift
    local timestamp
    timestamp="$(date +"%Y-%m-%d %H:%M:%S")"

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

TARGET_USER=""

usage() {
    echo "Usage: sudo $0 [--user USERNAME]"
    echo ""
    echo "Options:"
    echo "  --user USERNAME   User to install Homebrew for (default: \$SUDO_USER)"
    exit 1
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --user)
                TARGET_USER="$2"
                shift 2
                ;;
            --help|-h)
                usage
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                ;;
        esac
    done
}

check_root() {
    if [[ "$(id -u)" -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
    log_info "Running with root privileges"
}

resolve_target_user() {
    if [[ -z "$TARGET_USER" ]]; then
        TARGET_USER="${SUDO_USER:-}"
    fi

    if [[ -z "$TARGET_USER" ]]; then
        log_error "Cannot determine target user. Run with sudo or pass --user USERNAME"
        exit 1
    fi

    if ! id "$TARGET_USER" &>/dev/null; then
        log_error "User '$TARGET_USER' does not exist"
        exit 1
    fi

    log_info "Target user for Homebrew: $TARGET_USER"
}

install_apt_packages() {
    log_info "Updating apt package database"
    apt-get update

    log_info "Installing core system packages via apt"
    apt-get install -y build-essential curl git procps file

    log_info "Core apt packages installed"
}

install_homebrew() {
    if sudo -u "$TARGET_USER" bash -c 'cd ~; command -v brew' &>/dev/null; then
        log_info "Homebrew is already installed, skipping"
        return
    fi

    log_info "Installing Homebrew for user $TARGET_USER"
    sudo -u "$TARGET_USER" NONINTERACTIVE=1 /bin/bash -c \
        "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    log_info "Homebrew installed successfully"
}

install_brew_packages() {
    log_info "Installing packages via Homebrew"

    local packages=(
        jq
        neovim
        htop
        tmux
        wget
        ripgrep
        rsync
        gnupg
    )

    sudo -u "$TARGET_USER" bash -c '
        cd ~
        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
        brew install '"$(printf '%s ' "${packages[@]}")"'
    '

    log_info "Homebrew packages installed"
}

main() {
    log_info "Starting base packages installation for Ubuntu 24.04"

    parse_args "$@"
    check_root
    resolve_target_user

    install_apt_packages
    install_homebrew
    install_brew_packages

    log_info "Base packages have been successfully installed"
}

main "$@"
