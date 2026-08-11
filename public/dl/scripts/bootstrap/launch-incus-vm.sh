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

# Image must be the `/cloud` variant so cloud-init runs (the plain
# images:ubuntu/26.04 image does not include cloud-init).
IMAGE="${INCUS_IMAGE:-images:ubuntu/26.04/cloud}"
# Username created inside the VM by cloud-init.
VM_USER="${INCUS_VM_USER:-mattjmcnaughton}"

NAME=""
CPU=""
MEM_GIB=""
DISK_GIB="20"

usage() {
    cat <<'USAGE'
Usage: launch-incus-vm.sh -n NAME -c CPU -m MEM [-d DISK]

Launch a cloud-init-enabled Incus VM with the given resources.

  -n NAME   VM name (required)
  -c CPU    number of vCPUs (required)
  -m MEM    memory in GiB (required)
  -d DISK   root disk size in GiB (default: 20)
  -h        show this help

Environment overrides:
  INCUS_IMAGE     image to launch (default: images:ubuntu/26.04/cloud)
  INCUS_VM_USER   cloud-init username (default: mattjmcnaughton)
USAGE
}

parse_args() {
    while getopts ":n:c:m:d:h" opt; do
        case "$opt" in
            n) NAME="$OPTARG" ;;
            c) CPU="$OPTARG" ;;
            m) MEM_GIB="$OPTARG" ;;
            d) DISK_GIB="$OPTARG" ;;
            h) usage; exit 0 ;;
            :) log_error "Option -$OPTARG requires an argument"; usage; exit 1 ;;
            \?) log_error "Unknown option -$OPTARG"; usage; exit 1 ;;
        esac
    done

    if [[ -z "$NAME" || -z "$CPU" || -z "$MEM_GIB" ]]; then
        log_error "Missing required arguments"
        usage
        exit 1
    fi

    for pair in "CPU:$CPU" "MEM:$MEM_GIB" "DISK:$DISK_GIB"; do
        local field="${pair%%:*}" value="${pair#*:}"
        if ! [[ "$value" =~ ^[0-9]+$ ]]; then
            log_error "$field must be a positive integer (got '$value')"
            exit 1
        fi
    done
}

check_incus_installed() {
    if ! command -v incus >/dev/null 2>&1; then
        log_error "incus is not installed (see install-incus-ubuntu.sh)"
        exit 1
    fi
}

# The `base` profile carries the cloud-init user-data. It intentionally defines
# no devices -- the root disk is inherited from the `default` profile and its
# size is overridden per-VM at launch time.
ensure_base_profile() {
    if ! incus profile show base >/dev/null 2>&1; then
        log_info "Creating incus 'base' profile"
        incus profile create base
    else
        log_info "Updating incus 'base' profile"
    fi

    incus profile edit base <<EOF
name: base
config:
  boot.autostart: "true"
  security.secureboot: "false"
  user.user-data: |
    #cloud-config
    users:
      - name: ${VM_USER}
        uid: 1000
        groups: sudo,adm
        shell: /bin/bash
        sudo: ["ALL=(ALL) NOPASSWD:ALL"]
        lock_passwd: true
    package_update: true
    package_upgrade: true
    packages:
      - wget
      - curl
      - vim
description: Base VM profile (cloud-init user + common packages)
devices: {}
EOF
}

launch_vm() {
    if incus info "$NAME" >/dev/null 2>&1; then
        log_info "VM '$NAME' already exists, nothing to do"
        exit 0
    fi

    log_info "Launching VM '$NAME' (${CPU} vCPU, ${MEM_GIB}GiB RAM, ${DISK_GIB}GiB disk)"
    incus launch "$IMAGE" "$NAME" --vm \
        --profile default --profile base \
        --config "limits.cpu=${CPU}" \
        --config "limits.memory=${MEM_GIB}GiB" \
        --device "root,size=${DISK_GIB}GiB"
}

wait_cloud_init_done() {
    log_info "Waiting for cloud-init to finish"
    local tries=0
    local max_tries=24
    while (( tries < max_tries )); do
        local status
        status="$(incus exec "$NAME" -- cloud-init status 2>/dev/null || true)"
        if grep -q "status: done" <<<"$status"; then
            log_info "cloud-init finished"
            return 0
        fi
        if grep -q "status: error" <<<"$status"; then
            log_error "cloud-init reported an error"
            incus exec "$NAME" -- cloud-init status --long || true
            exit 1
        fi
        tries=$((tries + 1))
        sleep 5
    done
    log_warn "Timed out waiting for cloud-init; check 'incus exec $NAME -- cloud-init status --long'"
}

main() {
    parse_args "$@"

    log_info "Starting incus VM launch script"

    check_incus_installed
    ensure_base_profile
    launch_vm
    wait_cloud_init_done

    incus list "$NAME" -c nsc4M
    log_info "VM '$NAME' has been successfully launched"
}

main "$@"
