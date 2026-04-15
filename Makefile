COMPOSE ?= docker compose

.DEFAULT_GOAL := help

.PHONY: help init up up-d down stop restart build rebuild logs ps \
        backend-logs frontend-logs db-logs \
        backend-sh frontend-sh db-sh psql \
        test backend-test frontend-test frontend-build clean nuke \
        lint fmt fmt-check backend-lint backend-fmt frontend-lint frontend-fmt check

help: ## このヘルプを表示
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

init: ## .env を .env.example から作成
	@test -f .env || cp .env.example .env
	@echo ".env ready. Edit secrets before production use."

up: init ## フォアグラウンドで起動 (Ctrl+C で停止)
	$(COMPOSE) up --build

up-d: init ## バックグラウンドで起動
	$(COMPOSE) up -d --build

down: ## 停止 + コンテナ削除 (volume は保持)
	$(COMPOSE) down

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
