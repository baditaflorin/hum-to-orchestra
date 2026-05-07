# 0015 Deployment Topology

- Status: Accepted
- Date: 2026-05-08

## Context

Mode C would require Docker Compose, nginx, TLS, Prometheus, and a backend image. Mode A does not.

## Decision

Use GitHub Pages only.

Topology:

```mermaid
flowchart LR
  browser["User browser"] --> pages["GitHub Pages CDN"]
  pages --> static["docs/ static assets"]
```

## Consequences

- No `deploy/` directory is required.
- No Docker image is built or pushed.
- No host port, nginx config, Prometheus, or server runbook exists.

## Alternatives Considered

- Docker backend topology was rejected by ADR 0001.
