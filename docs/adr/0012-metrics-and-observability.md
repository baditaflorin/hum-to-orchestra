# 0012 Metrics And Observability

- Status: Accepted
- Date: 2026-05-08

## Context

Observability should respect user privacy and Mode A static hosting.

## Decision

No analytics, metrics beacons, or server-side observability are enabled in v0.1.0.

The UI displays local status only: note count, confidence, key center, BPM, version, build commit, and live main commit.

## Consequences

- There is no usage dashboard.
- User recordings and arrangements stay local.

## Alternatives Considered

- Plausible or a Cloudflare Worker beacon was rejected because usage insight is not necessary for v1.
