#!/usr/bin/env bash
set -Eeuo pipefail
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

MODE="single-user"
NIX_VERSION=""
MODIFY_PROFILE=true
CHROOT_DIR="$HOME/.nix"
TMPDIR_SELF=""

cleanup() {
    if [[ -n "$TMPDIR_SELF" && -d "$TMPDIR_SELF" ]]; then
        rm -rf "$TMPDIR_SELF"
    fi
}
trap cleanup EXIT

usage() {
    cat <<'EOF'
Usage: install-nix-userspace-linux.sh [options]

Installs Nix for a single user. No Nix daemon, no `nixbld` system users, no
systemd unit -- the store and all profiles belong to the invoking user.

Options:
  --mode <single-user|rootless>
                       single-user (default): the vendor-documented
                       `--no-daemon` install. /nix is owned by you. Creating
                       /nix itself is the one step that needs sudo.

                       rootless: no privileges at all. Installs
                       nix-user-chroot and bootstraps Nix inside ~/.nix,
                       bind-mounted as /nix via user namespaces. Use this on
                       machines where you have no sudo.
  --version <x.y.z>    Install a pinned Nix version instead of latest.
  --chroot-dir <path>  Store location for --mode rootless (default: ~/.nix).
  --no-modify-profile  Do not let the installer touch your shell profile.
  --help, -h           Show this help.

Examples:
  install-nix-userspace-linux.sh
  install-nix-userspace-linux.sh --version 2.31.2
  install-nix-userspace-linux.sh --mode rootless
EOF
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --mode)
                MODE="${2:-}"
                if [[ "$MODE" != "single-user" && "$MODE" != "rootless" ]]; then
                    log_error "Unknown mode: ${MODE:-<empty>} (expected single-user or rootless)"
                    exit 1
                fi
                shift 2
                ;;
            --version)
                NIX_VERSION="${2:-}"
                if [[ -z "$NIX_VERSION" ]]; then
                    log_error "--version requires a value"
                    exit 1
                fi
                shift 2
                ;;
            --chroot-dir)
                CHROOT_DIR="${2:-}"
                if [[ -z "$CHROOT_DIR" ]]; then
                    log_error "--chroot-dir requires a value"
                    exit 1
                fi
                shift 2
                ;;
            --no-modify-profile)
                MODIFY_PROFILE=false
                shift
                ;;
            --help|-h)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage >&2
                exit 1
                ;;
        esac
    done
}

check_not_root() {
    if [[ "$(id -u)" -eq 0 ]]; then
        log_error "This script must NOT be run as root -- it installs Nix for a single user"
        exit 1
    fi
    log_info "Running as user: $(whoami)"
}

require_commands() {
    local missing=()
    local cmd
    for cmd in "$@"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing+=("$cmd")
        fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required commands: ${missing[*]}"
        exit 1
    fi
}

check_already_installed() {
    if command -v nix >/dev/null 2>&1; then
        log_info "Nix is already installed: $(nix --version)"
        return 0
    fi
    if [[ -e "$HOME/.nix-profile/bin/nix" ]]; then
        log_info "Nix is already installed at ~/.nix-profile/bin/nix (not on PATH)"
        return 0
    fi
    return 1
}

# The installer downloads to a file before executing so a truncated transfer
# cannot be partially interpreted by the shell.
fetch_installer() {
    local url="https://nixos.org/nix/install"

    if [[ -n "$NIX_VERSION" ]]; then
        url="https://releases.nixos.org/nix/nix-${NIX_VERSION}/install"
        log_info "Using pinned Nix version $NIX_VERSION"
    else
        log_info "Using the latest Nix release"
    fi

    log_info "Downloading the Nix installer from $url"
    curl -fsSL "$url" -o "$TMPDIR_SELF/nix-install"
    chmod +x "$TMPDIR_SELF/nix-install"
}

ensure_nix_dir() {
    if [[ -d /nix ]]; then
        local owner
        owner="$(stat -c '%U' /nix)"
        if [[ "$owner" == "$(id -un)" || -w /nix ]]; then
            log_info "/nix already exists and is writable by $(id -un)"
            return 0
        fi
        log_error "/nix exists but is owned by '$owner' and is not writable by you"
        log_error "Either fix ownership (chown $(id -un) /nix) or use --mode rootless"
        exit 1
    fi

    log_info "/nix does not exist; it must be created once with root privileges"

    if ! command -v sudo >/dev/null 2>&1; then
        log_error "sudo is not available and /nix does not exist"
        log_error "Ask an administrator to run:"
        log_error "  mkdir -m 0755 /nix && chown $(id -un):$(id -gn) /nix"
        log_error "Or re-run with --mode rootless to avoid root entirely"
        exit 1
    fi

    if ! sudo -v; then
        log_error "Could not obtain sudo privileges to create /nix"
        log_error "Re-run with --mode rootless to avoid root entirely"
        exit 1
    fi

    log_info "Creating /nix owned by $(id -un)"
    sudo mkdir -m 0755 /nix
    sudo chown "$(id -un):$(id -gn)" /nix
}

install_single_user() {
    ensure_nix_dir
    fetch_installer

    local args=(--no-daemon)
    if [[ "$MODIFY_PROFILE" == false ]]; then
        args+=(--no-modify-profile)
    fi

    log_info "Running the Nix installer with: ${args[*]}"
    "$TMPDIR_SELF/nix-install" "${args[@]}"

    log_info "Single-user Nix installation completed"
}

check_user_namespaces() {
    if unshare --user --pid true >/dev/null 2>&1; then
        log_info "Unprivileged user namespaces are available"
        return 0
    fi

    log_error "Unprivileged user namespaces are unavailable; --mode rootless cannot work"
    log_error "Check: sysctl kernel.unprivileged_userns_clone (Debian) or"
    log_error "       sysctl user.max_user_namespaces"
    exit 1
}

detect_musl_target() {
    local machine
    machine="$(uname -m)"

    case "$machine" in
        x86_64)          echo "x86_64-unknown-linux-musl" ;;
        aarch64|arm64)   echo "aarch64-unknown-linux-musl" ;;
        *)
            log_error "Unsupported architecture for --mode rootless: $machine"
            exit 1
            ;;
    esac
}

install_nix_user_chroot() {
    local target
    target="$(detect_musl_target)"

    log_info "Resolving the latest nix-user-chroot release for $target"

    # Resolved at runtime rather than hard-coded so the script does not rot
    # every time upstream cuts a release.
    local asset_url
    asset_url="$(curl -fsSL https://api.github.com/repos/nix-community/nix-user-chroot/releases/latest \
        | grep -o '"browser_download_url": *"[^"]*"' \
        | cut -d'"' -f4 \
        | grep -- "$target" \
        | head -n 1 || true)"

    if [[ -z "$asset_url" ]]; then
        log_error "Could not find a nix-user-chroot release asset for $target"
        exit 1
    fi

    log_info "Downloading $asset_url"
    mkdir -p "$HOME/.local/bin"
    curl -fsSL "$asset_url" -o "$TMPDIR_SELF/nix-user-chroot"
    chmod +x "$TMPDIR_SELF/nix-user-chroot"
    mv "$TMPDIR_SELF/nix-user-chroot" "$HOME/.local/bin/nix-user-chroot"

    log_info "Installed nix-user-chroot to ~/.local/bin/nix-user-chroot"
}

write_chroot_wrapper() {
    local wrapper="$HOME/.local/bin/nix-chroot"

    cat > "$wrapper" <<EOF
#!/usr/bin/env bash
# Managed by install-nix-userspace-linux.sh
# Enters a namespace where $CHROOT_DIR is mounted as /nix.
# With no arguments it drops you into a login shell.
set -Eeuo pipefail

if [[ \$# -eq 0 ]]; then
    exec "\$HOME/.local/bin/nix-user-chroot" "$CHROOT_DIR" "\${SHELL:-/bin/bash}" -l
fi

exec "\$HOME/.local/bin/nix-user-chroot" "$CHROOT_DIR" "\$@"
EOF

    chmod +x "$wrapper"
    log_info "Wrote wrapper ~/.local/bin/nix-chroot"
}

install_rootless() {
    require_commands unshare
    check_user_namespaces
    install_nix_user_chroot

    if [[ ! -d "$CHROOT_DIR" ]]; then
        log_info "Creating store directory $CHROOT_DIR"
        mkdir -p "$CHROOT_DIR"
        chmod 0755 "$CHROOT_DIR"
    fi

    fetch_installer

    local args=(--no-daemon)
    if [[ "$MODIFY_PROFILE" == false ]]; then
        args+=(--no-modify-profile)
    fi

    log_info "Bootstrapping Nix inside $CHROOT_DIR"
    "$HOME/.local/bin/nix-user-chroot" "$CHROOT_DIR" \
        "$TMPDIR_SELF/nix-install" "${args[@]}"

    write_chroot_wrapper

    log_info "Rootless Nix installation completed"
}

configure_nix_conf() {
    local conf_dir="${XDG_CONFIG_HOME:-$HOME/.config}/nix"
    local conf="$conf_dir/nix.conf"

    mkdir -p "$conf_dir"
    touch "$conf"

    if grep -qE '^[[:space:]]*experimental-features[[:space:]]*=' "$conf"; then
        log_info "experimental-features already set in $conf, leaving it alone"
        return 0
    fi

    log_info "Enabling nix-command and flakes in $conf"
    cat >> "$conf" <<'EOF'

# Managed by install-nix-userspace-linux.sh
experimental-features = nix-command flakes
warn-dirty = false
EOF
}

print_next_steps() {
    echo ""
    echo "----------------------------------------"
    if [[ "$MODE" == "single-user" ]]; then
        echo "Nix is installed in single-user mode."
        echo ""
        echo "Start a new shell, or source the profile in this one:"
        echo "  . \"\$HOME/.nix-profile/etc/profile.d/nix.sh\""
        echo ""
        echo "Then verify with:"
        echo "  nix --version"
        echo "  nix run nixpkgs#hello"
    else
        echo "Nix is installed in rootless mode inside $CHROOT_DIR."
        echo ""
        echo "Nix only exists inside the namespace. Enter it with:"
        echo "  nix-chroot            # login shell with /nix available"
        echo "  nix-chroot nix --version"
        echo ""
        echo "Make sure ~/.local/bin is on your PATH."
    fi
    echo ""
    echo "Uninstall by removing the store directory and the profile symlinks:"
    if [[ "$MODE" == "single-user" ]]; then
        echo "  rm -rf /nix ~/.nix-profile ~/.nix-defexpr ~/.nix-channels ~/.local/state/nix"
    else
        echo "  rm -rf $CHROOT_DIR ~/.local/bin/nix-user-chroot ~/.local/bin/nix-chroot"
    fi
    echo "----------------------------------------"
}

main() {
    parse_args "$@"

    log_info "Starting user-space Nix installation (mode: $MODE)"

    check_not_root
    require_commands curl

    if check_already_installed; then
        log_info "Nothing to do"
        exit 0
    fi

    TMPDIR_SELF="$(mktemp -d)"

    case "$MODE" in
        single-user) install_single_user ;;
        rootless)    install_rootless ;;
    esac

    configure_nix_conf
    print_next_steps

    log_info "Nix has been successfully installed"
}

main "$@"
