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

ALL_COMPONENTS=(uv rust go node pnpm claude codex pi opencode cooldowns shell)

COMPONENTS=("${ALL_COMPONENTS[@]}")
COOLDOWN_DAYS=7
DRY_RUN=false
FORCE=false

FNM_INSTALL_DIR="$HOME/.local/share/fnm"
GO_INSTALL_DIR="$HOME/.local/go"
PNPM_HOME_DIR="$HOME/.local/share/pnpm"
LOCAL_BIN="$HOME/.local/bin"

CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
ENV_FILE="$CONFIG_HOME/dev-env/env.sh"

BLOCK_BEGIN="# >>> dev-env (managed by setup-dev-environment-linux.sh) >>>"
BLOCK_END="# <<< dev-env <<<"

TMPDIR_SELF=""
SUMMARY=()

cleanup() {
    if [[ -n "$TMPDIR_SELF" && -d "$TMPDIR_SELF" ]]; then
        rm -rf "$TMPDIR_SELF"
    fi
}
trap cleanup EXIT

usage() {
    cat <<'EOF'
Usage: setup-dev-environment-linux.sh [options]

Installs a language and agent toolchain into $HOME using each vendor's own
recommended installer, then turns on dependency cooldowns so freshly published
package versions are not installed immediately.

Installs:
  uv        Python packaging          (astral.sh installer)
  rust      rustup + stable toolchain (sh.rustup.rs)
  go        Go toolchain              (go.dev tarball, checksum verified)
  node      Node.js via fnm           (fnm.vercel.app installer, latest LTS)
  pnpm      pnpm                      (get.pnpm.io installer)
  claude    Claude Code               (claude.ai native installer)
  codex     OpenAI Codex CLI          (npm: @openai/codex)
  pi        Pi coding agent           (pi.dev installer)
  opencode  opencode                  (opencode.ai installer)

Then configures:
  cooldowns Minimum release age for npm, pnpm, uv and cargo
  shell     A single ~/.config/dev-env/env.sh sourced from your shell rc

Options:
  --only <a,b,c>       Only run these components (see list above).
  --skip <a,b,c>       Run everything except these components.
  --cooldown-days <n>  Minimum age of a dependency release before it may be
                       installed. Default: 7. Use 0 to write no-op configs.
  --no-cooldown        Same as --skip cooldowns.
  --force              Rewrite config sections this script does not own
                       instead of skipping them.
  --dry-run            Report what would happen without changing anything.
  --help, -h           Show this help.

Examples:
  setup-dev-environment-linux.sh
  setup-dev-environment-linux.sh --only node,pnpm,codex
  setup-dev-environment-linux.sh --skip go,rust --cooldown-days 14
  setup-dev-environment-linux.sh --dry-run

Everything installs under $HOME. The script never needs root, is safe to
re-run, and skips any component that is already present.
EOF
}

# The script sets IFS to newline+tab, so "${array[*]}" would join on newlines.
join_by_space() {
    local IFS=' '
    echo "$*"
}

split_list() {
    local IFS=','
    # shellcheck disable=SC2206
    local parts=($1)
    printf '%s\n' "${parts[@]}"
}

validate_components() {
    local requested="$1"
    local item known
    while IFS= read -r item; do
        [[ -z "$item" ]] && continue
        known=false
        for candidate in "${ALL_COMPONENTS[@]}"; do
            if [[ "$item" == "$candidate" ]]; then
                known=true
                break
            fi
        done
        if [[ "$known" == false ]]; then
            log_error "Unknown component: $item"
            log_error "Valid components: $(join_by_space "${ALL_COMPONENTS[@]}")"
            exit 1
        fi
    done < <(split_list "$requested")
}

parse_args() {
    local only="" skip=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --only)
                only="${2:-}"
                if [[ -z "$only" ]]; then
                    log_error "--only requires a comma separated list"
                    exit 1
                fi
                shift 2
                ;;
            --skip)
                skip="${2:-}"
                if [[ -z "$skip" ]]; then
                    log_error "--skip requires a comma separated list"
                    exit 1
                fi
                shift 2
                ;;
            --cooldown-days)
                COOLDOWN_DAYS="${2:-}"
                if ! [[ "$COOLDOWN_DAYS" =~ ^[0-9]+$ ]]; then
                    log_error "--cooldown-days requires a non-negative integer"
                    exit 1
                fi
                shift 2
                ;;
            --no-cooldown)
                skip="${skip:+$skip,}cooldowns"
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
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

    if [[ -n "$only" && -n "$skip" ]]; then
        log_error "--only and --skip are mutually exclusive"
        exit 1
    fi

    if [[ -n "$only" ]]; then
        validate_components "$only"
        mapfile -t COMPONENTS < <(split_list "$only")
    elif [[ -n "$skip" ]]; then
        validate_components "$skip"
        local skipped
        skipped="$(split_list "$skip")"
        local remaining=()
        for candidate in "${ALL_COMPONENTS[@]}"; do
            if ! grep -qxF "$candidate" <<<"$skipped"; then
                remaining+=("$candidate")
            fi
        done
        COMPONENTS=("${remaining[@]+${remaining[@]}}")
    fi

    if [[ ${#COMPONENTS[@]} -eq 0 ]]; then
        log_error "No components left to run"
        exit 1
    fi
}

wants() {
    local target="$1"
    for candidate in "${COMPONENTS[@]}"; do
        if [[ "$candidate" == "$target" ]]; then
            return 0
        fi
    done
    return 1
}

check_not_root() {
    if [[ "$(id -u)" -eq 0 ]]; then
        log_error "This script must NOT be run as root -- it installs into \$HOME"
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
        log_error "Missing required commands: $(join_by_space "${missing[@]}")"
        log_error "Install them with your system package manager and re-run"
        exit 1
    fi
}

note() {
    SUMMARY+=("$1")
}

# Downloads to a file before executing so a truncated transfer cannot be
# partially interpreted by the shell.
fetch() {
    local url="$1"
    local dest="$2"

    log_info "Downloading $url"
    curl -fsSL "$url" -o "$dest"
}

prepend_path() {
    local dir="$1"
    case ":$PATH:" in
        *":$dir:"*) ;;
        *) export PATH="$dir:$PATH" ;;
    esac
}

# ---------------------------------------------------------------------------
# Managed config blocks
# ---------------------------------------------------------------------------

# Writes a marked block into a config file, replacing the block from a previous
# run. Files this script does not already own are backed up once.
write_managed_block() {
    local file="$1"
    local content="$2"

    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would write a managed block to $file"
        return 0
    fi

    mkdir -p "$(dirname "$file")"

    if [[ ! -f "$file" ]]; then
        : > "$file"
    elif ! grep -qF "$BLOCK_BEGIN" "$file" && [[ -s "$file" ]]; then
        local backup
        backup="${file}.bak.$(date +%Y%m%d%H%M%S)"
        cp "$file" "$backup"
        log_info "Backed up $file to $backup"
    fi

    if grep -qF "$BLOCK_BEGIN" "$file"; then
        local stripped="$TMPDIR_SELF/stripped.$$"
        awk -v begin="$BLOCK_BEGIN" -v end="$BLOCK_END" '
            index($0, begin) { skip = 1 }
            !skip            { print }
            index($0, end)   { skip = 0 }
        ' "$file" > "$stripped"
        cat "$stripped" > "$file"
        rm -f "$stripped"
    fi

    {
        echo "$BLOCK_BEGIN"
        echo "$content"
        echo "$BLOCK_END"
    } >> "$file"

    log_info "Updated $file"
}

# True when the file already defines a key outside of our managed block.
has_foreign_key() {
    local file="$1"
    local pattern="$2"

    [[ -f "$file" ]] || return 1

    awk -v begin="$BLOCK_BEGIN" -v end="$BLOCK_END" '
        index($0, begin) { skip = 1 }
        !skip            { print }
        index($0, end)   { skip = 0 }
    ' "$file" | grep -qE "$pattern"
}

# ---------------------------------------------------------------------------
# Language toolchains
# ---------------------------------------------------------------------------

install_uv() {
    if command -v uv >/dev/null 2>&1; then
        log_info "uv is already installed ($(uv --version))"
        prepend_path "$LOCAL_BIN"
        return 0
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would install uv via https://astral.sh/uv/install.sh"
        return 0
    fi

    log_info "Installing uv"
    fetch "https://astral.sh/uv/install.sh" "$TMPDIR_SELF/uv-install.sh"

    # PATH is owned by our env file, so tell the installer to keep its hands off.
    UV_INSTALL_DIR="$LOCAL_BIN" UV_NO_MODIFY_PATH=1 sh "$TMPDIR_SELF/uv-install.sh"

    prepend_path "$LOCAL_BIN"
    note "uv        $(uv --version 2>/dev/null || echo 'installed')"
}

install_rust() {
    if command -v rustup >/dev/null 2>&1; then
        log_info "rustup is already installed ($(rustup --version 2>/dev/null | head -n1))"
        prepend_path "$HOME/.cargo/bin"
        return 0
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would install rustup via https://sh.rustup.rs"
        return 0
    fi

    log_info "Installing rustup and the stable toolchain"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs -o "$TMPDIR_SELF/rustup-init.sh"
    sh "$TMPDIR_SELF/rustup-init.sh" -y --no-modify-path --default-toolchain stable

    prepend_path "$HOME/.cargo/bin"
    note "rust      $(rustc --version 2>/dev/null || echo 'installed')"
}

go_arch() {
    local machine
    machine="$(uname -m)"

    case "$machine" in
        x86_64)        echo "amd64" ;;
        aarch64|arm64) echo "arm64" ;;
        armv6l|armv7l) echo "armv6l" ;;
        i686|i386)     echo "386" ;;
        *)
            log_error "Unsupported architecture for Go: $machine"
            exit 1
            ;;
    esac
}

install_go() {
    require_commands sha256sum tar

    local latest
    latest="$(curl -fsSL 'https://go.dev/VERSION?m=text' | head -n1)"

    if [[ ! "$latest" =~ ^go[0-9] ]]; then
        log_error "Could not determine the latest Go version (got: ${latest:-<empty>})"
        exit 1
    fi

    if [[ -x "$GO_INSTALL_DIR/bin/go" ]]; then
        local current
        current="$("$GO_INSTALL_DIR/bin/go" version | awk '{print $3}')"
        if [[ "$current" == "$latest" ]]; then
            log_info "Go is already at $current"
            prepend_path "$GO_INSTALL_DIR/bin"
            return 0
        fi
        log_info "Upgrading Go from $current to $latest"
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would install $latest into $GO_INSTALL_DIR"
        return 0
    fi

    local arch tarball
    arch="$(go_arch)"
    tarball="${latest}.linux-${arch}.tar.gz"

    fetch "https://go.dev/dl/${tarball}" "$TMPDIR_SELF/$tarball"

    log_info "Verifying the Go tarball checksum"
    local expected
    expected="$(curl -fsSL "https://dl.google.com/go/${tarball}.sha256")"
    echo "${expected}  ${TMPDIR_SELF}/${tarball}" | sha256sum -c - >/dev/null

    log_info "Extracting $latest into $GO_INSTALL_DIR"
    tar -C "$TMPDIR_SELF" -xzf "$TMPDIR_SELF/$tarball"
    rm -rf "$GO_INSTALL_DIR"
    mkdir -p "$(dirname "$GO_INSTALL_DIR")"
    mv "$TMPDIR_SELF/go" "$GO_INSTALL_DIR"

    prepend_path "$GO_INSTALL_DIR/bin"
    note "go        $(go version 2>/dev/null || echo "$latest")"
}

install_node() {
    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would install fnm and the latest Node.js LTS"
        return 0
    fi

    if ! command -v fnm >/dev/null 2>&1 && [[ ! -x "$FNM_INSTALL_DIR/fnm" ]]; then
        log_info "Installing fnm"
        fetch "https://fnm.vercel.app/install" "$TMPDIR_SELF/fnm-install.sh"
        bash "$TMPDIR_SELF/fnm-install.sh" --install-dir "$FNM_INSTALL_DIR" --skip-shell
    else
        log_info "fnm is already installed"
    fi

    prepend_path "$FNM_INSTALL_DIR"
    eval "$(fnm env --shell bash)"

    log_info "Installing the latest Node.js LTS"
    fnm install --lts

    if ! fnm use lts-latest >/dev/null 2>&1; then
        log_warn "Could not select the 'lts-latest' alias; falling back to the newest installed version"
        local newest
        newest="$(fnm list | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | sort -V | tail -n1)"
        fnm use "$newest"
    fi

    local active
    active="$(fnm current)"
    fnm default "$active"
    log_info "Default Node.js version set to $active"

    note "node      $(node --version 2>/dev/null || echo "$active")"
    note "npm       $(npm --version 2>/dev/null || echo 'installed')"
}

install_pnpm() {
    if command -v pnpm >/dev/null 2>&1; then
        log_info "pnpm is already installed ($(pnpm --version))"
        prepend_path "$PNPM_HOME_DIR"
        return 0
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would install pnpm via https://get.pnpm.io/install.sh"
        return 0
    fi

    log_info "Installing pnpm"
    fetch "https://get.pnpm.io/install.sh" "$TMPDIR_SELF/pnpm-install.sh"
    env PNPM_HOME="$PNPM_HOME_DIR" SHELL="$(command -v bash)" sh "$TMPDIR_SELF/pnpm-install.sh"

    export PNPM_HOME="$PNPM_HOME_DIR"
    prepend_path "$PNPM_HOME_DIR"
    note "pnpm      $(pnpm --version 2>/dev/null || echo 'installed')"
}

# ---------------------------------------------------------------------------
# Coding agents
# ---------------------------------------------------------------------------

install_claude() {
    if command -v claude >/dev/null 2>&1; then
        log_info "Claude Code is already installed ($(claude --version 2>/dev/null || echo present))"
        return 0
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would install Claude Code via https://claude.ai/install.sh"
        return 0
    fi

    log_info "Installing Claude Code"
    fetch "https://claude.ai/install.sh" "$TMPDIR_SELF/claude-install.sh"
    bash "$TMPDIR_SELF/claude-install.sh"

    prepend_path "$LOCAL_BIN"
    note "claude    $(claude --version 2>/dev/null || echo 'installed')"
}

install_codex() {
    if command -v codex >/dev/null 2>&1; then
        log_info "Codex CLI is already installed ($(codex --version 2>/dev/null || echo present))"
        return 0
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would install Codex CLI via npm install -g @openai/codex"
        return 0
    fi

    if ! command -v npm >/dev/null 2>&1; then
        log_warn "npm is unavailable, skipping Codex CLI (run with the 'node' component first)"
        return 0
    fi

    log_info "Installing the Codex CLI"
    npm install -g @openai/codex

    note "codex     $(codex --version 2>/dev/null || echo 'installed')"
}

install_pi() {
    if command -v pi >/dev/null 2>&1; then
        log_info "Pi is already installed ($(pi --version 2>/dev/null || echo present))"
        return 0
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would install Pi via https://pi.dev/install.sh"
        return 0
    fi

    log_info "Installing the Pi coding agent"
    fetch "https://pi.dev/install.sh" "$TMPDIR_SELF/pi-install.sh"
    sh "$TMPDIR_SELF/pi-install.sh"

    prepend_path "$LOCAL_BIN"
    note "pi        $(pi --version 2>/dev/null || echo 'installed')"
}

install_opencode() {
    if command -v opencode >/dev/null 2>&1; then
        log_info "opencode is already installed ($(opencode --version 2>/dev/null || echo present))"
        return 0
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would install opencode via https://opencode.ai/install"
        return 0
    fi

    log_info "Installing opencode"
    fetch "https://opencode.ai/install" "$TMPDIR_SELF/opencode-install.sh"
    bash "$TMPDIR_SELF/opencode-install.sh"

    prepend_path "$LOCAL_BIN"
    note "opencode  $(opencode --version 2>/dev/null || echo 'installed')"
}

# ---------------------------------------------------------------------------
# Dependency cooldowns
#
# A cooldown refuses to resolve any dependency version published less than N
# days ago. Most malicious releases are caught and pulled from the registry
# within hours, so waiting turns that detection window into a defence.
# ---------------------------------------------------------------------------

configure_npm_cooldown() {
    local file="$HOME/.npmrc"

    if has_foreign_key "$file" '^[[:space:]]*min-release-age[[:space:]]*='; then
        if [[ "$FORCE" == false ]]; then
            log_warn "$file already sets min-release-age; leaving it alone (use --force to override)"
            return 0
        fi
        log_warn "$file already sets min-release-age; adding our block anyway (--force)"
    fi

    write_managed_block "$file" "min-release-age=${COOLDOWN_DAYS}"
    note "npm       min-release-age=${COOLDOWN_DAYS} days (~/.npmrc)"
}

configure_pnpm_cooldown() {
    local file="$CONFIG_HOME/pnpm/config.yaml"
    local minutes=$((COOLDOWN_DAYS * 24 * 60))

    if has_foreign_key "$file" '^[[:space:]]*minimumReleaseAge[[:space:]]*:'; then
        if [[ "$FORCE" == false ]]; then
            log_warn "$file already sets minimumReleaseAge; leaving it alone (use --force to override)"
            return 0
        fi
        log_warn "$file already sets minimumReleaseAge; adding our block anyway (--force)"
    fi

    write_managed_block "$file" "minimumReleaseAge: ${minutes}"
    note "pnpm      minimumReleaseAge=${minutes} minutes (${file/#$HOME/\~})"
}

configure_uv_cooldown() {
    local file="$CONFIG_HOME/uv/uv.toml"

    # exclude-newer is a top-level key, so it has to precede every table.
    # Appending to a file that already opens a table would nest it by accident.
    if [[ -f "$file" ]] && has_foreign_key "$file" '^[[:space:]]*\['; then
        if [[ "$FORCE" == false ]]; then
            log_warn "$file already defines TOML tables; not appending a top-level key (use --force to override)"
            log_warn "Add this by hand above the first table: exclude-newer = \"${COOLDOWN_DAYS} days\""
            return 0
        fi
        log_warn "$file already defines TOML tables; appending anyway (--force) -- check the result"
    fi

    write_managed_block "$file" "exclude-newer = \"${COOLDOWN_DAYS} days\""
    note "uv        exclude-newer=\"${COOLDOWN_DAYS} days\" (${file/#$HOME/\~})"
}

configure_cargo_cooldown() {
    local file="$HOME/.cargo/config.toml"

    if has_foreign_key "$file" '^[[:space:]]*\[(unstable|registry)\]'; then
        if [[ "$FORCE" == false ]]; then
            log_warn "$file already defines [unstable] or [registry]; skipping to avoid duplicate TOML tables (use --force to override)"
            return 0
        fi
        log_warn "$file already defines [unstable] or [registry]; appending anyway (--force) -- check for duplicate tables"
    fi

    # RFC 3923. Landed on nightly as -Zmin-publish-age; stable cargo ignores
    # the [unstable] table, so this is a no-op there rather than an error.
    write_managed_block "$file" "$(cat <<EOF
[unstable]
min-publish-age = true

[registry]
global-min-publish-age = "${COOLDOWN_DAYS} days"
EOF
)"
    note "cargo     global-min-publish-age=\"${COOLDOWN_DAYS} days\" (~/.cargo/config.toml, nightly only)"
}

configure_cooldowns() {
    if [[ "$COOLDOWN_DAYS" -eq 0 ]]; then
        log_warn "--cooldown-days 0 disables the cooldown; writing no-op configs"
    fi

    log_info "Configuring dependency cooldowns (${COOLDOWN_DAYS} days)"

    configure_npm_cooldown
    configure_pnpm_cooldown
    configure_uv_cooldown
    configure_cargo_cooldown

    log_warn "Go has no cooldown mechanism; pin versions in go.mod and rely on go.sum plus the checksum database"
}

# ---------------------------------------------------------------------------
# Shell environment
# ---------------------------------------------------------------------------

write_env_file() {
    if [[ "$DRY_RUN" == true ]]; then
        log_info "[dry-run] Would write $ENV_FILE"
        return 0
    fi

    mkdir -p "$(dirname "$ENV_FILE")"

    cat > "$ENV_FILE" <<EOF
# Managed by setup-dev-environment-linux.sh -- edits are overwritten.
# Sourced from your shell rc. Safe to source more than once.

_dev_env_path_prepend() {
    case ":\$PATH:" in
        *":\$1:"*) ;;
        *) PATH="\$1:\$PATH" ;;
    esac
}

_dev_env_path_prepend "\$HOME/.local/bin"

# rust
if [ -f "\$HOME/.cargo/env" ]; then
    . "\$HOME/.cargo/env"
fi

# go
if [ -d "$GO_INSTALL_DIR/bin" ]; then
    _dev_env_path_prepend "$GO_INSTALL_DIR/bin"
    export GOPATH="\${GOPATH:-\$HOME/go}"
    _dev_env_path_prepend "\$GOPATH/bin"
fi

# pnpm
if [ -d "$PNPM_HOME_DIR" ]; then
    export PNPM_HOME="$PNPM_HOME_DIR"
    _dev_env_path_prepend "\$PNPM_HOME"
fi

# node via fnm
if [ -d "$FNM_INSTALL_DIR" ]; then
    _dev_env_path_prepend "$FNM_INSTALL_DIR"
fi
if command -v fnm >/dev/null 2>&1; then
    eval "\$(fnm env --use-on-cd)"
fi

export PATH
unset -f _dev_env_path_prepend
EOF

    log_info "Wrote $ENV_FILE"
}

hook_shell_rc() {
    local rc
    local hooked=false

    for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
        # Create .bashrc if missing; only touch .zshrc when zsh is actually set up.
        if [[ ! -f "$rc" && "$rc" != "$HOME/.bashrc" ]]; then
            continue
        fi

        if [[ "$DRY_RUN" == true ]]; then
            log_info "[dry-run] Would source $ENV_FILE from $rc"
            hooked=true
            continue
        fi

        if [[ -f "$rc" ]] && grep -qF "$BLOCK_BEGIN" "$rc"; then
            log_info "$rc already sources the dev-env file"
            hooked=true
            continue
        fi

        {
            echo ""
            echo "$BLOCK_BEGIN"
            # An `if` rather than `[ -f ... ] &&` so the rc file does not end on
            # a non-zero status when the env file is absent.
            echo "if [ -f \"${ENV_FILE/#$HOME/\$HOME}\" ]; then"
            echo "    . \"${ENV_FILE/#$HOME/\$HOME}\""
            echo "fi"
            echo "$BLOCK_END"
        } >> "$rc"

        log_info "Hooked $ENV_FILE into $rc"
        hooked=true
    done

    if [[ "$hooked" == false ]]; then
        log_warn "No shell rc file was updated; source $ENV_FILE yourself"
    fi
}

configure_shell() {
    write_env_file
    hook_shell_rc
    note "shell     ${ENV_FILE/#$HOME/\~} sourced from your shell rc"
}

# ---------------------------------------------------------------------------

print_summary() {
    echo ""
    echo "----------------------------------------"
    if [[ "$DRY_RUN" == true ]]; then
        echo "Dry run complete. Nothing was changed."
        echo "Components that would run: $(join_by_space "${COMPONENTS[@]}")"
        echo "----------------------------------------"
        return 0
    fi

    echo "Development environment ready."
    echo ""
    local line
    for line in "${SUMMARY[@]+${SUMMARY[@]}}"; do
        echo "  $line"
    done
    echo ""
    echo "Start a new shell, or load everything into this one:"
    echo "  . \"$ENV_FILE\""
    echo ""
    echo "Cooldowns were applied after installation, so they govern your next"
    echo "install, not the versions this run just fetched. Bypass one for a"
    echo "single command when you need an urgent fix, for example:"
    echo "  npm install --min-release-age=0 <pkg>"
    echo "  pnpm install --config.minimumReleaseAge=0"
    echo "  uv sync --exclude-newer-package <pkg>=false"
    echo "----------------------------------------"
}

main() {
    parse_args "$@"

    log_info "Starting development environment setup"
    log_info "Components: $(join_by_space "${COMPONENTS[@]}")"

    check_not_root
    require_commands curl

    TMPDIR_SELF="$(mktemp -d)"

    if wants uv;        then install_uv;        fi
    if wants rust;      then install_rust;      fi
    if wants go;        then install_go;        fi
    if wants node;      then install_node;      fi
    if wants pnpm;      then install_pnpm;      fi

    if wants claude;    then install_claude;    fi
    if wants codex;     then install_codex;     fi
    if wants pi;        then install_pi;        fi
    if wants opencode;  then install_opencode;  fi

    if wants cooldowns; then configure_cooldowns; fi
    if wants shell;     then configure_shell;     fi

    print_summary

    log_info "Development environment setup complete"
}

main "$@"
