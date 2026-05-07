# Architecture

Hum-to-Orchestra is a Mode A static web app served entirely by GitHub Pages.

Live app: https://baditaflorin.github.io/hum-to-orchestra/

Repository: https://github.com/baditaflorin/hum-to-orchestra

## C4 Context

```mermaid
flowchart TD
  composer["Composer / songwriter"] --> app["Hum-to-Orchestra static app"]
  app --> browser["Browser APIs: MediaRecorder, Web Audio, IndexedDB"]
  app --> github["GitHub public commit API"]
  app --> pages["GitHub Pages CDN"]
  app --> exports["Local MusicXML / JSON files"]
```

## C4 Container

```mermaid
flowchart LR
  shell["React app shell"] --> input["Audio capture/import"]
  input --> transcription["Pitch transcription module"]
  transcription --> arranger["Arrangement engine"]
  arranger --> preview["Score preview"]
  arranger --> playback["Tone.js playback chunk"]
  arranger --> musicxml["MusicXML export"]
  arranger --> idb["IndexedDB autosave"]
```

## Module Boundaries

- `src/features/audio/`: browser audio decoding and pitch transcription.
- `src/features/orchestration/`: deterministic arrangement presets and score generation.
- `src/features/playback/`: lazy Tone.js playback adapter.
- `src/features/export/`: MusicXML and JSON export.
- `src/features/storage/`: IndexedDB persistence.
- `src/components/`: focused UI views.
- `docs/`: GitHub Pages build output plus documentation and ADRs.

## GitHub Pages Boundary

Everything under `docs/` is public static content. There is no runtime server, runtime database, backend auth, or secret-bearing API.
