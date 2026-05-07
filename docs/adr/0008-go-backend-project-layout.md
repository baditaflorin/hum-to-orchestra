# 0008 Go Backend Project Layout

- Status: Accepted
- Date: 2026-05-08

## Context

The bootstrap defines a Go layout for Mode B or Mode C. This project is Mode A.

## Decision

Do not create Go backend directories in v0.1.0.

## Consequences

- `cmd/`, `internal/`, `pkg/`, `api/`, and Docker backend files are absent.
- Go hook steps are skipped when no Go files exist.

## Alternatives Considered

- Adding empty Go directories was rejected because it would imply a backend that does not exist.
