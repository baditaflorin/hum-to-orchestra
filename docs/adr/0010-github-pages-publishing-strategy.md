# 0010 GitHub Pages Publishing Strategy

- Status: Accepted
- Date: 2026-05-08

## Context

The live URL must work from day one and serve a static frontend.

## Decision

Publish from the `main` branch `/docs` folder at:

https://baditaflorin.github.io/hum-to-orchestra/

Vite uses base path `/hum-to-orchestra/`, hashed assets, and a `404.html` SPA fallback copied from `index.html`.

Documentation and ADR files also live under `docs/`, so the build cleans only generated Pages assets instead of deleting the whole directory.

## Consequences

- `docs/` is intentionally tracked and not gitignored.
- Rebuilding updates static assets while preserving docs.
- Rollback is a normal git revert of the publishing commit.

## Alternatives Considered

- A `gh-pages` branch was rejected to keep source, docs, and Pages output together.
- Publishing from repo root was rejected because it would expose too many development files.
