---
title: "Btrfs on Root with Ubuntu 24.04"
date: "2026-03-26T10:00:00"
description: "Converting an Ubuntu 24.04 install from ext4 to btrfs on an encrypted root partition."
tags: ["infrastructure", "homelab", "note", "ai-assisted"]
---

Ubuntu 24.04's installer doesn't offer btrfs as a root filesystem option with
LUKS + LVM. But `btrfs-convert` handles the conversion in-place — just boot
back into the live USB after installing.

## The conversion

Install Ubuntu normally with LUKS + LVM. Reboot into the live USB (F7 on
Geekom machines), drop into a shell (Alt-F4), and convert:

```bash
# Unlock the encrypted partition (check lsblk -f for the right device)
sudo cryptsetup luksOpen /dev/nvme0n1pX cryptroot
sudo vgchange -ay

# Convert ext4 to btrfs in-place
sudo e2fsck -f /dev/mapper/ubuntu--vg-ubuntu--lv
sudo btrfs-convert /dev/mapper/ubuntu--vg-ubuntu--lv
```

Reboot into the installed system, then update initramfs and grub:

```bash
sudo update-initramfs -u
sudo update-grub
```

Reboot again and you're done. Ubuntu's installer also tends to under-allocate
the logical volume — expand it with:

```bash
sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
sudo btrfs filesystem resize max /
```

## Why btrfs on root?

I still use ZFS for my NAS — nothing beats it for storage pools and RAID. But
for root on servers, btrfs is lighter weight and gives me compression,
snapshots before risky changes, and better disk monitoring out of the box.
Worth the five minutes of extra setup.

---

_This post was drafted in collaboration with
[Claude Opus 4.6](https://www.anthropic.com/claude). I'm still figuring out
what AI attribution should look like on this blog. My rough plan: attribute when
AI is part of the brainstorming or writing process, and tag those posts w/
`ai-assisted`. Posts prior to 2026 had no AI involvement. Expect this to evolve
as I sort out what I actually want from this blog and how AI fits into that._
