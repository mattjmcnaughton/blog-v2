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

TODO: Lint via shellcheck (and configure as pre-commit hook).
