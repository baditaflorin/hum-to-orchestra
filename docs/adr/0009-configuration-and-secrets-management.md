# 0009 Configuration And Secrets Management

- Status: Accepted
- Date: 2026-05-08

## Context

The frontend is public static code and must never contain secrets.

## Decision

Use only public build-time configuration:

- `VITE_PUBLIC_BASE` for the Pages base path.
- package version for display.
- public GitHub commit metadata fetched at runtime for display.

No API keys, tokens, passwords, or private endpoints are accepted in frontend configuration.

## Consequences

- `.env.example` contains placeholders only.
- `.env*`, private keys, and certificate files are gitignored.
- `gitleaks protect --staged` is enforced by the pre-commit hook.

## Alternatives Considered

- Obfuscated frontend secrets were rejected because public bundles cannot protect secrets.
