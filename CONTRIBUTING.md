# Contributing

Thanks for improving Hum-to-Orchestra.

## Local Setup

```bash
npm install
make install-hooks
npm run dev
```

## Workflow

- Use Conventional Commits, for example `feat: add brass voicing control`.
- Run `make lint`, `make test`, and `make build` before pushing.
- Do not commit secrets, private keys, `.env` files, or generated local logs.
- Keep Mode A static unless an ADR justifies a backend.

## Pull Request Checklist

- The app still builds into `docs/`.
- The live app links remain visible: https://github.com/baditaflorin/hum-to-orchestra and https://www.paypal.com/paypalme/florinbadita.
- Version and commit metadata still render in the top bar.
- New orchestration or transcription logic has unit coverage.
