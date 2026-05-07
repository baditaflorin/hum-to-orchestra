#!/usr/bin/env bash
set -euo pipefail

npm run build
PLAYWRIGHT_PORT="${PLAYWRIGHT_PORT:-4179}" npm run test:e2e
