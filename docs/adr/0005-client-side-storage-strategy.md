# 0005 Client-Side Storage Strategy

- Status: Accepted
- Date: 2026-05-08

## Context

The app should remember the latest melody and arrangement without requiring accounts or a backend.

## Decision

Use IndexedDB through `idb` for the last project snapshot. Avoid localStorage for larger score data.

## Consequences

- Autosave works offline.
- Users retain control through browser site-data settings.
- There is no cross-device sync in v1.

## Alternatives Considered

- localStorage was rejected because score JSON can grow and localStorage is synchronous.
- Server persistence was rejected as out of scope for Mode A.
