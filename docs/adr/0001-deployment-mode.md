# 0001 Deployment Mode

- Status: Accepted
- Date: 2026-05-08

## Context

The app should let a user hum or import a melody, transcribe it, arrange it, play it, and export score data. The project bootstrap requires GitHub Pages first and a backend only if static delivery is genuinely insufficient.

## Decision

Use Mode A: pure GitHub Pages.

The browser handles audio capture, pitch extraction, arrangement generation, playback, export, and local persistence. There is no runtime backend, database, auth service, or secret-bearing API.

## Consequences

- The public surface is static and cheap to host.
- Heavy model files must be lazy, optional, or deferred because Pages has no backend inference service.
- Microphone access and playback depend on browser support.
- Runtime secrets are impossible by design.

## Alternatives Considered

- Mode B: rejected because v1 has no external dataset that needs scheduled generation.
- Mode C: rejected because v1 has no cross-device sync, private inference, user auth, or server-side mutations.
