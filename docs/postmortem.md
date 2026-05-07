# Postmortem

Date: 2026-05-08

Live app: https://baditaflorin.github.io/hum-to-orchestra/

Repository: https://github.com/baditaflorin/hum-to-orchestra

## What Was Built

Hum-to-Orchestra v0.1.0 is a static GitHub Pages app that records or imports a hum, extracts a pitch contour in the browser, turns it into quantized notes, arranges it into five ensemble styles, plays the result with Tone.js, and exports MusicXML or JSON.

The page also shows the app version, live main commit, GitHub repository link, and PayPal support link.

## Was Mode A Correct?

Yes. Mode A was the right choice for v0.1.0.

The core value works without auth, shared persistence, private inference, runtime writes, or secrets. A backend would have added deployment and security burden without improving the first user experience.

## What Worked

- GitHub Pages was sufficient for the complete v1 loop.
- Tone.js worked well as a lazy-loaded playback engine.
- Deterministic orchestration presets gave immediate, inspectable musical output.
- MusicXML export provides a practical bridge to notation tools and Music21-compatible workflows.
- Playwright smoke tests caught local Pages path issues before final delivery.

## What Did Not Work

- The first Pages build showed `build uncommitted` because it was created before the first git commit existed. The final implementation uses GitHub's public commit API for live commit display, avoiding commit-derived dirty builds.
- A generic static server did not mimic GitHub Pages project paths. A small preview server was added for `/hum-to-orchestra/`.

## What Surprised Us

The static path constraint mattered more than the audio code. Serving the app under the GitHub Pages project prefix needed explicit preview support to test correctly.

## Tech Debt Accepted

- Whisper, CREPE, MusicGen via ONNX, and Python Music21 are not bundled in v0.1.0. ADR 0006 documents this as a deliberate asset-budget and static-hosting decision.
- The orchestration engine is deterministic rather than model-generated.
- Instrument playback uses synth approximations rather than sampled orchestral libraries.
- The app stores only the latest local project, not a full project library.

## Next 3 Improvements

1. Add an optional worker-based CREPE or ONNX pitch adapter behind a user action.
2. Add MIDI export and a compact editable piano-roll correction step before orchestration.
3. Add sampled instrument packs as optional lazy downloads for more realistic playback.

## Time Spent Vs Estimate

Estimated: 4 to 6 hours for a polished static v1.

Actual: about 3 hours for scaffold, implementation, docs, tests, Pages publishing, and verification.
