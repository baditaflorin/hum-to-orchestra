# 0011 Logging Strategy

- Status: Accepted
- Date: 2026-05-08

## Context

Mode A has no server logs. Browser console noise should be minimal in production.

## Decision

Do not add production logging beyond browser-native errors. UI-visible errors are shown as inline status messages. Service worker registration failures are silent enhancements.

## Consequences

- Users see actionable messages for microphone, decode, transcription, and playback failures.
- No client logs are collected remotely.

## Alternatives Considered

- Remote logging was rejected because v1 has no analytics or backend.
