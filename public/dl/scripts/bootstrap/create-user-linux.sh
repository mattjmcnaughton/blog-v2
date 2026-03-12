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

validate_args() {
    if [[ $# -lt 1 ]] || [[ $# -gt 2 ]]; then
        log_error "Usage: $0 <username> [<comma_separated_groups>]"
        log_error "Example: $0 newuser docker,adm,www-data"
        exit 1
    fi

    local username="$1"

    if [[ -z "$username" ]]; then
        log_error "Username cannot be empty"
        exit 1
    fi

    if id "$username" &>/dev/null; then
        log_error "User '$username' already exists"
        exit 1
    fi

    log_info "Arguments validated"
}

create_user() {
    local username="$1"
    local extra_groups="${2:-}"

    # Add sudo to groups by default
    local all_groups="sudo"

    # Add additional groups if provided
    if [[ -n "$extra_groups" ]]; then
        all_groups="$all_groups,$extra_groups"
    fi

    log_info "Creating user '$username' with groups: $all_groups"
    useradd -m -s /bin/bash -G "$all_groups" "$username"

    log_info "Setting up SSH directory"
    local ssh_dir="/home/$username/.ssh"
    mkdir -p "$ssh_dir"
    chmod 700 "$ssh_dir"
    chown -R "$username:$username" "$ssh_dir"

    log_info "Setting up passwordless sudo"
    echo "$username ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/$username"
    chmod 440 "/etc/sudoers.d/$username"

    log_info "User '$username' created successfully"
}

main() {
    log_info "Starting user creation script"

    check_root
    validate_args "$@"

    local username="$1"
    local extra_groups="${2:-}"

    create_user "$username" "$extra_groups"

    log_info "User setup complete for '$username'"
}

main "$@"
