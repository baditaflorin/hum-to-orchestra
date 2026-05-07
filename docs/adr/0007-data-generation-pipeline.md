# 0007 Data Generation Pipeline

- Status: Accepted
- Date: 2026-05-08

## Context

Mode B projects need a static data-generation pipeline. This project is Mode A.

## Decision

No data-generation pipeline exists in v0.1.0. `make data` prints a Mode A no-op message.

## Consequences

- There are no generated JSON, Parquet, or SQLite data artifacts.
- The app's only generated public artifacts are the built Pages files in `docs/`.

## Alternatives Considered

- Prebuilding model outputs was rejected because user recordings are private and local.
