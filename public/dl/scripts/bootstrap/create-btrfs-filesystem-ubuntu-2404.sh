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
    if [[ $# -ne 3 ]]; then
        log_error "Usage: $0 <comma_separated_device_paths> <filesystem_label> <mount_point>"
        log_error "Example: $0 /dev/nvme2n1,/dev/sdb,/dev/xvdf data-vol /data"
        exit 1
    fi

    local device_paths="$1"
    local fs_label="$2"
    local mount_point="$3"

    if [[ -z "$device_paths" ]]; then
        log_error "Device paths cannot be empty"
        exit 1
    fi

    if [[ -z "$fs_label" ]]; then
        log_error "Filesystem label cannot be empty"
        exit 1
    fi

    if [[ -z "$mount_point" ]]; then
        log_error "Mount point cannot be empty"
        exit 1
    fi

    log_info "Arguments validated"
}

install_btrfs_progs() {
    log_info "Installing btrfs-progs"
    apt update
    apt install -y btrfs-progs
    log_info "btrfs-progs installed successfully"
}

find_available_device() {
    local device_paths="$1"
    local max_attempts=60
    local attempt=1
    local found_device=""

    # Split the comma-separated list into an array
    IFS=',' read -ra devices <<< "$device_paths"

    log_info "Searching for available devices among: ${device_paths}"

    while [[ $attempt -le $max_attempts ]]; do
        for device in "${devices[@]}"; do
            if [[ -b "$device" ]]; then
                log_info "Found available device: $device"
                found_device="$device"
                break 2
            fi
        done

        if [[ $attempt -ge $max_attempts ]]; then
            log_error "No devices found after $max_attempts attempts"
            log_error "Checked devices: ${device_paths}"
            exit 1
        fi

        log_info "No devices available yet, waiting (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done

    if [[ -z "$found_device" ]]; then
        log_error "No available devices found"
        exit 1
    fi

    echo "$found_device"
}

check_not_formatted() {
    local device_path="$1"

    log_info "Checking if device $device_path is already formatted"

    if blkid "$device_path" &>/dev/null; then
        log_error "Device $device_path is already formatted. Aborting."
        log_error "Current device details:"
        blkid "$device_path"
        exit 1
    fi

    log_info "Device $device_path is not formatted yet"
}

format_disk() {
    local device_path="$1"
    local fs_label="$2"

    log_info "Formatting device $device_path with btrfs filesystem, label: $fs_label"
    mkfs.btrfs -L "$fs_label" "$device_path"

    # Wait a moment for the kernel to recognize the new filesystem
    sleep 2

    log_info "Device $device_path formatted successfully"
}

setup_mount() {
    local device_path="$1"
    local fs_label="$2"
    local mount_point="$3"
    local device_uuid

    # Get the UUID of the formatted device
    device_uuid=$(blkid -s UUID -o value "$device_path")
    if [[ -z "$device_uuid" ]]; then
        log_error "Failed to get UUID for device $device_path"
        exit 1
    fi

    log_info "Device $device_path has UUID: $device_uuid"

    # Create the mount point
    log_info "Creating mount point: $mount_point"
    mkdir -p "$mount_point"

    # Check if entry already exists in fstab
    if grep -q "$device_uuid" /etc/fstab; then
        log_warn "Entry for this device already exists in /etc/fstab, not modifying"
    else
        log_info "Adding entry to /etc/fstab"
        echo "UUID=$device_uuid $mount_point btrfs defaults,noatime 0 2" >> /etc/fstab
    fi

    # Mount the filesystem
    log_info "Mounting filesystem"
    mount "$mount_point"

    # Set permissions
    log_info "Setting mount point permissions (755, owned by root)"
    chmod 755 "$mount_point"
    chown root:root "$mount_point"

    log_info "Mount setup completed successfully"
}

main() {
    log_info "Starting disk setup script"

    check_root
    validate_args "$@"

    local device_paths="$1"
    local fs_label="$2"
    local mount_point="$3"

    install_btrfs_progs

    # Find the first available device from the provided list
    local device_path
    device_path=$(find_available_device "$device_paths")

    check_not_formatted "$device_path"
    format_disk "$device_path" "$fs_label"
    setup_mount "$device_path" "$fs_label" "$mount_point"

    log_info "Disk setup complete for $device_path at $mount_point with label $fs_label"
}

main "$@"
