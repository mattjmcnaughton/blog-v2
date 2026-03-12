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

FORCE=false

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --force)
                FORCE=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--force]"
                echo ""
                echo "Options:"
                echo "  --force   Overwrite existing dotfiles without prompting"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
}

check_not_root() {
    if [[ "$(id -u)" -eq 0 ]]; then
        log_error "This script must NOT be run as root"
        exit 1
    fi
    log_info "Running as user: $(whoami)"
}

write_file() {
    local filepath="$1"
    local content="$2"
    local filename
    filename="$(basename "$filepath")"

    if [[ -f "$filepath" ]]; then
        if [[ "$FORCE" == true ]]; then
            log_info "Overwriting $filepath (--force)"
        else
            echo ""
            echo "$filepath already exists."
            echo "  [o] Overwrite"
            echo "  [s] Skip"
            echo "  [b] Backup and overwrite"
            read -rp "Choose action for $filename [o/s/b]: " choice
            case "$choice" in
                o|O)
                    log_info "Overwriting $filepath"
                    ;;
                s|S)
                    log_info "Skipping $filepath"
                    return
                    ;;
                b|B)
                    local backup="${filepath}.bak.$(date +%Y%m%d%H%M%S)"
                    cp "$filepath" "$backup"
                    log_info "Backed up $filepath to $backup"
                    ;;
                *)
                    log_warn "Invalid choice, skipping $filepath"
                    return
                    ;;
            esac
        fi
    fi

    echo "$content" > "$filepath"
    log_info "Wrote $filepath"
}

setup_bashrc() {
    local content
    content='# ~/.bashrc

# If not running interactively, do not do anything
[[ $- != *i* ]] && return

# Source environment variables
if [[ -f ~/.bash_env ]]; then
    source ~/.bash_env
fi

# Source aliases
if [[ -f ~/.bash_aliases ]]; then
    source ~/.bash_aliases
fi

# Homebrew
if [[ -d /home/linuxbrew/.linuxbrew ]]; then
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
fi

# Prompt
PS1='"'"'\[\e[1;32m\]\u@\h\[\e[0m\]:\[\e[1;34m\]\w\[\e[0m\]\$ '"'"'

# History settings
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth:erasedups
shopt -s histappend'

    write_file "$HOME/.bashrc" "$content"
}

setup_bash_env() {
    local content
    content='# ~/.bash_env — environment variables

export EDITOR="nvim"
export VISUAL="nvim"

export LANG="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

# Add local bin to PATH
export PATH="$HOME/.local/bin:$HOME/bin:$PATH"'

    write_file "$HOME/.bash_env" "$content"
}

setup_bash_aliases() {
    local content
    content='# ~/.bash_aliases — shell aliases

# ls
alias ll="ls -alF"
alias la="ls -A"
alias l="ls -CF"

# git
alias gs="git status"
alias gd="git diff"
alias gl="git log --oneline -20"

# safety
alias rm="rm -i"
alias cp="cp -i"
alias mv="mv -i"

# misc
alias grep="grep --color=auto"
alias df="df -h"
alias du="du -h"'

    write_file "$HOME/.bash_aliases" "$content"
}

main() {
    log_info "Starting bash dotfiles setup"

    parse_args "$@"
    check_not_root

    setup_bashrc
    setup_bash_env
    setup_bash_aliases

    log_info "Bash dotfiles setup complete"
}

main "$@"
