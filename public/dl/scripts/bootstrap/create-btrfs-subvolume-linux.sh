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
        log_error "Usage: $0 <root_volume> <subvolume_name> <mount_path>"
        log_error "Example: $0 /data docker /var/lib/docker"
        exit 1
    fi

    local root_volume="$1"
    local subvol_name="$2"
    local mount_path="$3"

    if [[ -z "$root_volume" ]]; then
        log_error "Root volume cannot be empty"
        exit 1
    fi

    if [[ -z "$subvol_name" ]]; then
        log_error "Subvolume name cannot be empty"
        exit 1
    fi

    if [[ -z "$mount_path" ]]; then
        log_error "Mount path cannot be empty"
        exit 1
    fi

    if ! findmnt -t btrfs "$root_volume" &>/dev/null; then
        log_error "Root volume $root_volume is not a mounted BTRFS filesystem"
        exit 1
    fi

    log_info "Arguments validated"
}

backup_existing_data() {
    local mount_path="$1"
    local temp_backup_dir

    if [[ ! -d "$mount_path" ]]; then
        log_info "No existing directory at $mount_path, no backup needed"
        return 0
    fi

    if [[ -d "$mount_path" ]] && [[ "$(find "$mount_path" -mindepth 1 -maxdepth 1 | wc -l)" -eq 0 ]]; then
        log_info "Directory $mount_path exists but is empty, no backup needed"
        return 0
    fi

    log_info "Backing up existing data from $mount_path"

    # Create a temporary backup directory
    temp_backup_dir="$(mktemp -d)"
    log_info "Created temporary backup directory: $temp_backup_dir"

    # Copy all data, preserving ownership, permissions, and attributes
    log_info "Copying data to backup location..."
    rsync -av --progress "$mount_path/" "$temp_backup_dir/"

    log_info "Backup completed successfully"
    echo "$temp_backup_dir"
}

create_subvolume() {
    local root_volume="$1"
    local subvol_name="$2"
    local subvol_path="$root_volume/$subvol_name"

    # Check if the subvolume already exists
    if btrfs subvolume list "$root_volume" | grep -q "path $subvol_name\$"; then
        log_warn "Subvolume $subvol_name already exists"
    else
        log_info "Creating BTRFS subvolume: $subvol_path"
        btrfs subvolume create "$subvol_path"
    fi

    log_info "Subvolume created/verified: $subvol_path"

    # Return the full path to the new subvolume
    echo "$subvol_path"
}

setup_mount() {
    local root_volume="$1"
    local subvol_name="$2"
    local mount_path="$3"
    local root_uuid

    # Get the UUID of the root volume
    root_uuid=$(findmnt -no UUID "$root_volume")
    if [[ -z "$root_uuid" ]]; then
        log_error "Failed to get UUID for root volume $root_volume"
        exit 1
    fi

    log_info "Root volume $root_volume has UUID: $root_uuid"

    # Check if there's an existing mount point
    if mountpoint -q "$mount_path"; then
        log_info "Unmounting existing mount at $mount_path"
        umount "$mount_path"
    fi

    # Ensure mount point exists
    log_info "Ensuring mount point exists: $mount_path"
    mkdir -p "$mount_path"

    # Check if entry already exists in fstab
    if grep -q "$mount_path" /etc/fstab; then
        log_info "Removing existing fstab entry for $mount_path"
        sed -i "\#[[:space:]]$mount_path[[:space:]]#d" /etc/fstab
    fi

    # Add the new entry to fstab
    log_info "Adding entry to /etc/fstab"
    echo "UUID=$root_uuid $mount_path btrfs defaults,subvol=$subvol_name,noatime 0 0" >> /etc/fstab

    # Mount the subvolume
    log_info "Mounting subvolume"
    mount "$mount_path"

    log_info "Mount setup completed successfully"
}

restore_data() {
    local mount_path="$1"
    local backup_dir="$2"

    if [[ -z "$backup_dir" ]] || [[ ! -d "$backup_dir" ]]; then
        log_info "No backup directory provided or directory doesn't exist, skipping data restoration"
        return 0
    fi

    log_info "Restoring data to $mount_path"

    # Copy all data back to the mount point, preserving ownership, permissions, and attributes
    rsync -av --progress "$backup_dir/" "$mount_path/"

    log_info "Data restoration completed successfully"

    # Clean up the temporary backup directory
    log_info "Cleaning up temporary backup directory"
    rm -rf "$backup_dir"
}

main() {
    log_info "Starting BTRFS subvolume creation script"

    check_root
    validate_args "$@"

    local root_volume="$1"
    local subvol_name="$2"
    local mount_path="$3"
    local backup_dir temp_mount

    # Backup existing data if necessary
    backup_dir=$(backup_existing_data "$mount_path")

    # Create the subvolume
    create_subvolume "$root_volume" "$subvol_name"

    # Setup the mount
    setup_mount "$root_volume" "$subvol_name" "$mount_path"

    # Restore data if we backed it up
    if [[ -n "$backup_dir" ]]; then
        restore_data "$mount_path" "$backup_dir"
    fi

    log_info "BTRFS subvolume setup complete for $subvol_name at $mount_path"
}

main "$@"
