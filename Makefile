COMPOSE ?= docker compose

.DEFAULT_GOAL := help

.PHONY: help init init-dev init-stg init-prd \
        up up-d up-dev up-dev-d up-stg up-stg-d up-prd up-prd-d \
        down down-dev down-stg down-prd stop restart build rebuild logs ps \
        backend-logs frontend-logs db-logs \
        backend-sh frontend-sh db-sh psql \
        test backend-test frontend-test frontend-build clean nuke \
        lint fmt fmt-check backend-lint backend-fmt frontend-lint frontend-fmt check

help: ## このヘルプを表示
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

init: ## .env を .env.dev.example から作成 (DEV 既定)
	@test -f .env || cp .env.dev.example .env
	@echo ".env ready. Edit secrets before production use."

init-dev: ## .env.dev を .env.dev.example から作成
	@test -f .env.dev || cp .env.dev.example .env.dev
	@echo ".env.dev ready."

init-stg: ## .env.stg を .env.stg.example から作成 (secrets を埋めること)
	@test -f .env.stg || cp .env.stg.example .env.stg
	@echo ".env.stg ready. Replace REPLACE_ME placeholders before deploy."

init-prd: ## .env.prd を .env.prd.example から作成 (secrets を埋めること)
	@test -f .env.prd || cp .env.prd.example .env.prd
	@echo ".env.prd ready. Replace REPLACE_ME placeholders before deploy."

up: up-dev ## デフォルトは DEV (alias of up-dev)

up-d: up-dev-d ## デフォルトは DEV (alias of up-dev-d)

up-dev: init-dev ## DEV 環境でフォアグラウンド起動
	$(COMPOSE) --env-file .env.dev up --build

up-dev-d: init-dev ## DEV 環境でバックグラウンド起動
	$(COMPOSE) --env-file .env.dev up -d --build

up-stg: init-stg ## STG 環境でフォアグラウンド起動
	$(COMPOSE) --env-file .env.stg up --build

up-stg-d: init-stg ## STG 環境でバックグラウンド起動
	$(COMPOSE) --env-file .env.stg up -d --build

up-prd: init-prd ## PRD 環境でフォアグラウンド起動
	$(COMPOSE) --env-file .env.prd up --build

up-prd-d: init-prd ## PRD 環境でバックグラウンド起動
	$(COMPOSE) --env-file .env.prd up -d --build

down: down-dev ## alias of down-dev

down-dev: ## DEV コンテナ停止 + 削除
	$(COMPOSE) --env-file .env.dev down

down-stg: ## STG コンテナ停止 + 削除
	$(COMPOSE) --env-file .env.stg down

down-prd: ## PRD コンテナ停止 + 削除
	$(COMPOSE) --env-file .env.prd down

stop: ## 停止のみ
	$(COMPOSE) stop

restart: ## 再起動
	$(COMPOSE) restart

build: ## イメージビルド
	$(COMPOSE) build

rebuild: ## キャッシュ無しで再ビルド
	$(COMPOSE) build --no-cache

ps: ## コンテナ一覧
	$(COMPOSE) ps

logs: ## 全サービスのログを追跡
	$(COMPOSE) logs -f --tail=200

backend-logs: ## backend のログ
	$(COMPOSE) logs -f --tail=200 backend

frontend-logs: ## frontend のログ
	$(COMPOSE) logs -f --tail=200 frontend

db-logs: ## postgres のログ
	$(COMPOSE) logs -f --tail=200 postgres

backend-sh: ## backend コンテナに sh で入る
	$(COMPOSE) exec backend sh

frontend-sh: ## frontend コンテナに sh で入る
	$(COMPOSE) exec frontend sh

db-sh: ## postgres コンテナに sh で入る
	$(COMPOSE) exec postgres sh

psql: ## psql で DB に接続
	$(COMPOSE) exec postgres sh -c 'psql -U $$POSTGRES_USER -d $$POSTGRES_DB'

test: backend-test frontend-test ## 全テスト実行

backend-test: ## backend の統合テスト (Testcontainers, Docker 必須)
	cd backend && ( [ -x ./gradlew ] || gradle wrapper --gradle-version 9.4.1 ) && ./gradlew test jacocoTestReport

frontend-test: ## frontend の単体テスト (Vitest)
	cd frontend && pnpm install --frozen-lockfile || pnpm install
	cd frontend && pnpm test

frontend-build: ## frontend のビルドチェック
	cd frontend && pnpm install && pnpm typecheck && pnpm build

# ---- Lint / Format ----

lint: backend-lint frontend-lint ## 全プロジェクトで lint

fmt: backend-fmt frontend-fmt ## 全プロジェクトで format 適用

fmt-check: ## format 差分の確認のみ (CI 用)
	cd backend && ( [ -x ./gradlew ] || gradle wrapper --gradle-version 9.4.1 ) && ./gradlew spotlessCheck
	cd frontend && pnpm format:check

backend-lint: ## backend: Spotless チェック
	cd backend && ( [ -x ./gradlew ] || gradle wrapper --gradle-version 9.4.1 ) && ./gradlew spotlessCheck

backend-fmt: ## backend: Spotless 適用
	cd backend && ( [ -x ./gradlew ] || gradle wrapper --gradle-version 9.4.1 ) && ./gradlew spotlessApply

frontend-lint: ## frontend: ESLint
	cd frontend && pnpm lint

frontend-fmt: ## frontend: Prettier 適用
	cd frontend && pnpm format

check: ## CI 相当 (lint + fmt-check + test)
	$(MAKE) fmt-check
	$(MAKE) lint
	$(MAKE) test

clean: ## コンテナ停止 + 削除 (volume 保持)
	$(COMPOSE) down --remove-orphans

nuke: ## コンテナ + volume + イメージ削除 (DB 消滅注意)
	$(COMPOSE) down -v --remove-orphans --rmi local
