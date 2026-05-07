# Privacy

Hum-to-Orchestra runs entirely in the browser.

## Data Collection

No analytics are enabled in v0.1.0.

The app does not send recordings, imported files, transcriptions, arrangements, or exports to a server.

## Local Storage

The last transcription and arrangement may be saved locally in IndexedDB so the app can restore your previous session.

You can clear this through the browser's site data controls.

## Network Requests

The app may request public GitHub repository metadata from:

https://api.github.com/repos/baditaflorin/hum-to-orchestra/commits/main

That request is used only to display the live `main` commit on the page.
