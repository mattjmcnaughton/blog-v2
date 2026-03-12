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

install_drivers() {
    log_info "Installing NVIDIA drivers and CUDA toolkit"

    apt update
    apt install -y nvidia-driver-535
    apt install -y nvidia-utils-535
    apt install -y nvidia-cuda-toolkit
    apt install -y nvtop

    log_info "NVIDIA drivers and tools installed successfully"
}

check_docker() {
    if command -v docker &>/dev/null; then
        log_info "Docker detected, installing NVIDIA Container Toolkit"
        return 0
    else
        log_info "Docker not detected, skipping NVIDIA Container Toolkit installation"
        return 1
    fi
}

install_container_toolkit() {
    log_info "Setting up NVIDIA Container Toolkit repository"

    mkdir -p /usr/share/keyrings
    curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

    curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

    log_info "Updating package lists"
    apt update

    log_info "Installing NVIDIA Container Toolkit"
    apt install -y nvidia-container-toolkit

    log_info "Configuring Docker to use NVIDIA runtime"
    nvidia-ctk runtime configure --runtime=docker

    log_info "Restarting Docker service"
    systemctl restart docker

    log_info "NVIDIA Container Toolkit installed and configured successfully"
}

print_status() {
    log_info "Checking NVIDIA driver installation status"

    echo ""
    echo "----------------------------------------"
    echo "NVIDIA INSTALLATION STATUS"
    echo "----------------------------------------"

    if command -v nvidia-smi &>/dev/null; then
        echo "[PASS] NVIDIA drivers are installed"
    else
        echo "[FAIL] NVIDIA drivers installation may have failed or needs a system reboot"
    fi

    if command -v nvtop &>/dev/null; then
        echo "[PASS] nvtop is installed"
    else
        echo "[FAIL] nvtop installation failed"
    fi

    if command -v docker &>/dev/null; then
        echo "[PASS] Docker is installed"
        if grep -q nvidia /etc/docker/daemon.json 2>/dev/null; then
            echo "[PASS] NVIDIA Container Toolkit is configured for Docker"
        else
            echo "[FAIL] NVIDIA Container Toolkit configuration for Docker may have failed"
        fi
    else
        echo "[INFO] Docker is not installed, NVIDIA Container Toolkit was not configured"
    fi

    echo ""
    echo "NEXT STEPS:"
    echo "1. Reboot your system to complete the installation: sudo reboot"
    echo "2. After reboot, verify installation with: nvidia-smi"
    if command -v docker &>/dev/null; then
        echo "3. Test NVIDIA with Docker: docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi"
    fi
    echo "----------------------------------------"
}

main() {
    log_info "Starting NVIDIA driver installation for Ubuntu 24.04"

    check_root
    install_drivers

    if check_docker; then
        install_container_toolkit
    fi

    print_status

    log_info "Installation complete. Please reboot your system to finalize the installation."
}

main "$@"
