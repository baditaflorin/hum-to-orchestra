# 0004 Static Data Contract

- Status: Accepted
- Date: 2026-05-08

## Context

Mode A has no scheduled data pipeline, but the app still needs stable local data contracts for project snapshots and exports.

## Decision

Use in-memory TypeScript interfaces for transcription and arrangements, JSON export for full project data, and MusicXML 3.1 for notation exchange.

Artifact contracts:

- Project JSON: `{ transcription, arrangement }`.
- MusicXML: one score-part per generated track.
- Local autosave: IndexedDB key `last-project` in database `hum-to-orchestra`.

## Consequences

- Users can move score output to notation tools and Music21 workflows.
- No committed data artifacts are required.
- Schema changes should be reflected in TypeScript interfaces and tests.

## Alternatives Considered

- SQLite or Parquet static artifacts were rejected because there is no shared dataset in v1.
- A runtime REST API was rejected by ADR 0001.
