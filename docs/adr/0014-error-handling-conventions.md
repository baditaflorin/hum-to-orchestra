# 0014 Error Handling Conventions

- Status: Accepted
- Date: 2026-05-08

## Context

Browser media APIs can fail for permissions, unsupported codecs, silent recordings, or autoplay rules.

## Decision

Catch expected user-facing failures and show concise inline messages. Keep exported functions deterministic and testable. Do not throw for recoverable empty transcription results.

## Consequences

- Users get clear next actions without console spelunking.
- Playback and recording failures do not crash the app.

## Alternatives Considered

- Global crash-only handling was rejected because media failures are normal user-path outcomes.
