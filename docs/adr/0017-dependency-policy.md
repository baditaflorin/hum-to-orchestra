# 0017 Dependency Policy

- Status: Accepted
- Date: 2026-05-08

## Context

The app touches audio, music playback, browser storage, and build tooling. Custom core implementations should be avoided where mature libraries exist.

## Decision

Use production-ready libraries:

- Vite, React, TypeScript, Tailwind CSS for frontend.
- `pitchy` for pitch detection.
- Tone.js for playback.
- `idb` for IndexedDB.
- `zod` for local data validation.
- Vitest and Playwright for tests.
- ESLint, Prettier, gitleaks for local quality gates.

## Consequences

- The app relies on maintained ecosystem packages.
- `npm audit --audit-level=high` is part of the security baseline.
- Heavy model dependencies require a new ADR before being added.

## Alternatives Considered

- Hand-written pitch detection and playback engines were rejected because mature libraries exist.
