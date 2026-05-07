# 0016 Local Git Hooks

- Status: Accepted
- Date: 2026-05-08

## Context

The project should use local hooks instead of GitHub Actions.

## Decision

Use plain `.githooks/` wired by `make install-hooks`.

Hooks:

- pre-commit: lint, TypeScript build check, optional Go checks when Go files exist, and `gitleaks protect --staged`.
- commit-msg: Conventional Commits validation.
- pre-push: `make test`, `make build`, Pages output verification, and `make smoke`.
- post-merge and post-checkout: dependency hinting.

## Consequences

- Checks run before local history leaves the machine.
- Contributors must install `gitleaks` for commits.

## Alternatives Considered

- Lefthook was rejected to keep the setup dependency-free.
- GitHub Actions were rejected by project constraints.
