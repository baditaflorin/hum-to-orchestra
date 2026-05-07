# 0003 Frontend Framework And Build Tooling

- Status: Accepted
- Date: 2026-05-08

## Context

The UI needs responsive controls, recording state, score preview, browser storage, and playback state. The build must publish to GitHub Pages.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, ESLint, Prettier, Vitest, and Playwright.

## Consequences

- Vite emits hashed assets directly into `docs/`.
- TypeScript catches music data contract mistakes.
- React keeps the interactive workflow simple.
- Tailwind is available while custom CSS handles the app's dense music-tool layout.

## Alternatives Considered

- Vanilla TypeScript was rejected because stateful media and playback UI would be more error-prone.
- Next.js was rejected because static GitHub Pages deployment does not need a server framework.
