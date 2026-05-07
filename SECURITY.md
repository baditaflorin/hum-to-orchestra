# Security Policy

## Supported Versions

Only the latest `main` branch and latest semver tag are supported.

## Reporting A Vulnerability

Please report security issues privately by email to florin@badita.ro.

Do not open a public issue containing exploit details, private data, credentials, or reproducible abuse steps.

## Security Baseline

- Mode A static deployment: no backend and no runtime secrets.
- The frontend never stores API keys or private credentials.
- `gitleaks protect --staged` runs from the pre-commit hook.
- `npm audit --audit-level=high` is available through `make audit`.
