# 0002 Architecture Overview And Module Boundaries

- Status: Accepted
- Date: 2026-05-08

## Context

The app needs a clear boundary between browser audio handling, music analysis, arrangement, playback, export, and persistence.

## Decision

Use feature modules:

- `features/audio` for input decoding and pitch transcription.
- `features/orchestration` for deterministic ensemble presets.
- `features/playback` for Tone.js integration.
- `features/export` for MusicXML and JSON.
- `features/storage` for IndexedDB.
- `components` for UI surfaces.

## Consequences

- Music logic can be unit tested without rendering the app.
- Tone.js stays isolated and lazy-loaded.
- Future CREPE/ONNX adapters can fit behind the audio transcription boundary.

## Alternatives Considered

- A single app file was rejected because orchestration logic and UI state would become hard to test.
- A backend-first service split was rejected by ADR 0001.
