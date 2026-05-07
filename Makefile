.DEFAULT_GOAL := help

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview docker-build docker-push release compose-up compose-down clean hooks-pre-commit hooks-commit-msg hooks-pre-push audit

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks.
	npm run install-hooks

dev: ## Run the frontend dev server.
	npm run dev

build: ## Build the GitHub Pages site into docs/.
	npm run build

data: ## Mode A has no static data pipeline.
	@echo "Mode A: no data-generation pipeline is required."

test: ## Run unit tests.
	npm run test

test-integration: ## Run e2e integration tests.
	npm run test:e2e

smoke: ## Build and smoke-test the Pages output.
	npm run smoke

lint: ## Run all linters and format checks.
	npm run lint

fmt: ## Autoformat source files.
	npm run fmt

pages-preview: ## Serve docs/ locally exactly as GitHub Pages would.
	npm run pages-preview

docker-build: ## Mode A skips Docker.
	@echo "Mode A: no Docker image is built."

docker-push: ## Mode A skips Docker.
	@echo "Mode A: no Docker image is pushed."

release: ## Tag the static Pages release.
	@bash scripts/release.sh

compose-up: ## Mode A skips Docker Compose.
	@echo "Mode A: no compose stack exists."

compose-down: ## Mode A skips Docker Compose.
	@echo "Mode A: no compose stack exists."

hooks-pre-commit: ## Run the pre-commit hook manually.
	npm run hooks:pre-commit

hooks-commit-msg: ## Run the commit-msg hook manually.
	npm run hooks:commit-msg

hooks-pre-push: ## Run the pre-push hook manually.
	npm run hooks:pre-push

audit: ## Check dependencies for high/critical advisories.
	npm run audit

clean: ## Remove local generated output.
	npm run clean
