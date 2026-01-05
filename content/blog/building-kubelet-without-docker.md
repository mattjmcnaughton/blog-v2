---
title: "Building Kubelet Without Docker"
date: "2019-06-15"
description: "A deep dive into the KEP for building kubelet without Docker dependencies and what it means for the Kubernetes ecosystem."
tags: ["kubernetes", "docker", "containers", "open-source"]
---

One of the most impactful projects I worked on during my time contributing to Kubernetes was the KEP (Kubernetes Enhancement Proposal) for building kubelet without Docker. This initiative aimed to decouple the kubelet from Docker-specific dependencies, paving the way for a more flexible container runtime ecosystem.

## The Problem

For years, Kubernetes had a tight coupling with Docker. While Docker was instrumental in popularizing containers, this coupling created several challenges:

```go
// Before: Docker-specific code scattered throughout kubelet
func (dm *DockerManager) RunContainer(config *ContainerConfig) error {
    client := dm.client
    // Docker-specific implementation
    return client.ContainerCreate(ctx, config, hostConfig, nil, containerName)
}
```

The kubelet binary included Docker client libraries, meaning even clusters using alternative runtimes like containerd or CRI-O still carried this baggage.

## The Solution

We proposed building kubelet with a pure CRI (Container Runtime Interface) approach:

```go
// After: Runtime-agnostic CRI calls
func (m *RuntimeManager) RunContainer(config *RuntimeConfig) error {
    req := &runtimeapi.CreateContainerRequest{
        PodSandboxId: config.SandboxID,
        Config:       config.ContainerConfig,
    }
    return m.runtimeService.CreateContainer(req)
}
```

This change reduced binary size, improved security by reducing attack surface, and simplified maintenance.

## Impact

The KEP was eventually implemented and shipped in Kubernetes 1.20+. Today, many production clusters run entirely Docker-free, using containerd or CRI-O as their container runtime. This work laid the groundwork for Docker's eventual deprecation as the default runtime in Kubernetes.

Looking back, this project taught me the value of incremental change in large open-source projects. We couldn't simply remove Docker support overnight - we had to provide a migration path and ensure backwards compatibility throughout the transition.
