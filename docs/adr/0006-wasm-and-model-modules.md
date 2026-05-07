# 0006 WASM And Model Modules

- Status: Accepted
- Date: 2026-05-08

## Context

The concept references Whisper, CREPE, MusicGen via ONNX, Tone.js, and Music21. GitHub Pages cannot run a private inference backend, and large model assets would hurt first load.

## Decision

V0.1.0 ships a production-usable browser path:

- Web Audio for capture and decoding.
- `pitchy` for client-side pitch detection.
- Deterministic orchestration presets for v1 arrangement.
- Tone.js lazy-loaded on playback.
- MusicXML export for Music21-compatible downstream work.

Do not bundle Whisper, CREPE, MusicGen, ONNX Runtime, or Music21 Python in v0.1.0. Add them later only behind explicit lazy adapters and model-size ADRs.

## Consequences

- Initial app load stays below the v1 asset budget.
- The app works from static hosting immediately.
- The marketing concept remains extensible without pretending that massive models are free to ship.

## Alternatives Considered

- Browser ONNX Runtime plus MusicGen was rejected for v1 because model assets are too large for a fast Pages app.
- A server-side model backend was rejected by ADR 0001.
