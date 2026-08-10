# scripts

A set of self-contained helper scripts for homelab operations.

All contain usage info, logging, etc.

A subset of these scripts are used as part of booting new machines (either
on-prem or cloud machines). As such, they may be symlinked to from Terraform
modules, etc. For this use case, we focus on everything necessary to get
`tailscale` installed.

Once tailscale is installed, we provision via Ansible
from our host machines. The more complex scripts are duplicated by Ansible playbooks (defined in
`hardware/ansible`), and are likely to be deleted entirely.

## Workstation scripts

A second, smaller group of scripts sets up a machine to _work on_ rather than a
machine to _run things on_. They run as an unprivileged user, install
everything under `$HOME`, and are safe to re-run.

### `install-nix-userspace-linux.sh`

Single-user Nix. No daemon, no `nixbld` system users, no systemd unit -- the
store and every profile belong to the invoking user.

```bash
curl -fsSL https://mattjmcnaughton.com/dl/scripts/bootstrap/install-nix-userspace-linux.sh | bash
```

`--mode single-user` (the default) is the vendor-documented `--no-daemon`
install; the one privileged step is creating `/nix`, which the script does with
`sudo` and then chowns to you. `--mode rootless` needs no privileges at all: it
installs `nix-user-chroot` and bootstraps Nix inside `~/.nix`, bind-mounted as
`/nix` through a user namespace, reachable via the generated `nix-chroot`
wrapper. Both modes enable `nix-command` and `flakes` in
`~/.config/nix/nix.conf`.

### `setup-dev-environment-linux.sh`

Installs language toolchains and coding agents using each vendor's own
recommended installer, then turns on dependency cooldowns.

```bash
curl -fsSL https://mattjmcnaughton.com/dl/scripts/bootstrap/setup-dev-environment-linux.sh | bash
```

| Component  | Source                                              |
| ---------- | --------------------------------------------------- |
| `uv`       | `astral.sh/uv/install.sh`                           |
| `rust`     | `sh.rustup.rs` (rustup + stable)                    |
| `go`       | `go.dev` tarball, SHA256 verified, to `~/.local/go` |
| `node`     | `fnm` installer, latest LTS set as default          |
| `pnpm`     | `get.pnpm.io/install.sh`                            |
| `claude`   | `claude.ai/install.sh` (native installer)           |
| `codex`    | `npm install -g @openai/codex`                      |
| `pi`       | `pi.dev/install.sh`                                 |
| `opencode` | `opencode.ai/install`                               |

Use `--only` / `--skip` to pick components, `--dry-run` to see the plan.

Rather than let five installers each append to `~/.bashrc`, the script writes a
single `~/.config/dev-env/env.sh` and sources it from your shell rc inside a
marked block. Installers are told to leave `PATH` alone where they support it.

#### Dependency cooldowns

A cooldown refuses to resolve any dependency version published less than N days
ago (default 7, set with `--cooldown-days`). Compromised releases are usually
caught and pulled from the registry within hours, so waiting turns that
detection window into a defence.

| Ecosystem | File                         | Setting                                      |
| --------- | ---------------------------- | -------------------------------------------- |
| npm       | `~/.npmrc`                   | `min-release-age=<days>`                     |
| pnpm      | `~/.config/pnpm/config.yaml` | `minimumReleaseAge: <minutes>`               |
| uv        | `~/.config/uv/uv.toml`       | `exclude-newer = "<n> days"`                 |
| cargo     | `~/.cargo/config.toml`       | `registry.global-min-publish-age` (RFC 3923) |

Go has no equivalent mechanism; pin versions in `go.mod` and lean on `go.sum`
and the checksum database.

Two caveats worth knowing. Cargo's option is still unstable, so it only takes
effect on nightly -- stable cargo ignores the `[unstable]` table rather than
erroring. And cooldowns are written _after_ the toolchain is installed, so they
govern your next install rather than the versions the bootstrap just fetched.

Each setting goes into a marked block the script owns. A file that already sets
one of these keys is left alone unless you pass `--force`, and any file the
script did not write is backed up before it is touched.

TODO: Lint via shellcheck (and configure as pre-commit hook).
