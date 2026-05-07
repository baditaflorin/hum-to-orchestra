#!/usr/bin/env bash
set -euo pipefail

VERSION="$(node -p "require('./package.json').version")"
TAG="v${VERSION}"

if git rev-parse "${TAG}" >/dev/null 2>&1; then
  echo "${TAG} already exists"
else
  git tag -a "${TAG}" -m "release: ${TAG}"
  echo "Created ${TAG}"
fi

