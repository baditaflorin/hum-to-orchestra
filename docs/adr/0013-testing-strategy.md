# 0013 Testing Strategy

- Status: Accepted
- Date: 2026-05-08

## Context

The highest-risk logic is pitch transcription, arrangement generation, export, and static Pages build integrity.

## Decision

Use:

- Vitest for unit tests.
- Playwright for one happy-path browser test.
- `scripts/smoke.sh` to build and run Playwright against the `docs/` output.
- `make test`, `make lint`, `make build`, and `make smoke` as local gates.

## Consequences

- Core music logic is covered without a backend.
- Smoke tests verify GitHub Pages-style serving.

## Alternatives Considered

- GitHub Actions were rejected because the bootstrap requires local hooks instead of CI.
