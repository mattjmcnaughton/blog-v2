---
title: "Container Runtime Interfaces Explained"
date: "2019-03-10"
description: "A practical guide to understanding CRI, OCI, and how container runtimes interact with Kubernetes."
tags: ["kubernetes", "containers", "cri", "architecture"]
---

One of the most confusing aspects of the container ecosystem is the alphabet soup of interfaces: CRI, OCI, CNI. Let me break down the container runtime interfaces and how they fit together.

## The Container Runtime Interface (CRI)

CRI is Kubernetes' interface for communicating with container runtimes. It's a gRPC API that defines two services:

```protobuf
service RuntimeService {
    // Pod sandbox operations
    rpc RunPodSandbox(RunPodSandboxRequest) returns (RunPodSandboxResponse);
    rpc StopPodSandbox(StopPodSandboxRequest) returns (StopPodSandboxResponse);

    // Container operations
    rpc CreateContainer(CreateContainerRequest) returns (CreateContainerResponse);
    rpc StartContainer(StartContainerRequest) returns (StartContainerResponse);
    rpc StopContainer(StopContainerRequest) returns (StopContainerResponse);
}

service ImageService {
    rpc PullImage(PullImageRequest) returns (PullImageResponse);
    rpc ListImages(ListImagesRequest) returns (ListImagesResponse);
}
```

The kubelet speaks CRI to whatever runtime is configured - containerd, CRI-O, or others.

## The OCI Specifications

The Open Container Initiative defines two specs:

**Runtime Spec** - How to run a container given a filesystem bundle:

```json
{
  "ociVersion": "1.0.0",
  "process": {
    "terminal": true,
    "user": { "uid": 0, "gid": 0 },
    "args": ["sh"],
    "env": ["PATH=/usr/bin:/bin"],
    "cwd": "/"
  },
  "root": {
    "path": "rootfs",
    "readonly": true
  }
}
```

**Image Spec** - How container images are structured and distributed.

## How They Fit Together

Here's the typical flow when Kubernetes starts a container:

```
┌──────────┐      CRI       ┌───────────┐     OCI      ┌─────────┐
│  kubelet │ ─────────────> │ containerd│ ──────────> │  runc   │
└──────────┘                └───────────┘              └─────────┘
                                  │
                                  │ Image pulls
                                  ▼
                            ┌───────────┐
                            │ Registry  │
                            └───────────┘
```

1. Kubelet calls containerd via CRI to create a container
2. Containerd pulls the image (OCI Image Spec) if needed
3. Containerd calls runc (OCI Runtime Spec) to actually start the container

## Why This Matters

This layered architecture provides flexibility. You can swap out any layer:

- Use CRI-O instead of containerd
- Use Kata Containers for VM-based isolation
- Use gVisor for kernel-level sandboxing

Understanding these interfaces helps you make informed decisions about your container infrastructure and debug issues when things go wrong.
