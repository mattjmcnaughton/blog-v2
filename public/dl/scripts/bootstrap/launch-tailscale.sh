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

check_arguments() {
    if [[ $# -ne 2 ]]; then
        log_error "Usage: $0 <ts_auth_key> <ts_hostname>"
        log_error "Example: $0 tskey-auth-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxx my-machine"
        exit 1
    fi

    local ts_auth_key="$1"
    local ts_hostname="$2"

    if [[ -z "$ts_auth_key" ]]; then
        log_error "TS Auth Key cannot be empty"
        exit 1
    fi

    if [[ -z "$ts_hostname" ]]; then
        log_error "Hostname cannot be empty"
        exit 1
    fi

    log_info "Arguments validated"
}

setup_tailscale() {
    local ts_auth_key="$1"
    local ts_hostname="$2"

    log_info "Setting up Tailscale with hostname: $ts_hostname"

    if ! command -v tailscale &> /dev/null; then
        log_error "Tailscale is not installed. Please install it first."
        exit 1
    fi

    log_info "Running tailscale up command..."
    tailscale up --ssh --auth-key "${ts_auth_key}" --hostname="${ts_hostname}"

    local status=$?
    if [[ $status -eq 0 ]]; then
        log_info "Tailscale setup completed successfully."
    else
        log_error "Tailscale setup failed with exit code $status."
        exit $status
    fi
}

print_reminders() {
    echo ""
    echo "----------------------------------------"
    echo "This Tailscale configuration will survive machine reboots."
    echo "Tailscale SSH access has been enabled."
    echo "Remember to disable node expiry via the Tailscale admin UI to"
    echo "prevent this node from being automatically removed after 180 days."
    echo "----------------------------------------"
}

main() {
    log_info "Starting Tailscale setup script"

    check_arguments "$@"
    setup_tailscale "$1" "$2"
    print_reminders

    log_info "Setup complete"
}

main "$@"
