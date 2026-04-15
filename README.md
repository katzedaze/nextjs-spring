# TODO アプリ (Next.js + Spring Boot + PostgreSQL)

マルチユーザ対応の TODO 管理 Web アプリ。

## スタック

- Frontend: Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- Backend: Spring Boot 4.1.0-M4 (Java 25 LTS) + Spring Security + JWT + JPA + Flyway
- DB: PostgreSQL 17
- 実行環境: Docker Compose

## セットアップ

```bash
make up        # .env 自動生成 + ビルド + フォアグラウンド起動
# または
make up-d      # バックグラウンド起動
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8080

## 主な make ターゲット

| コマンド | 用途 |
|----------|------|
| `make help` | 全ターゲット一覧 |
| `make up` / `make up-d` | 起動 (FG / BG) |
| `make down` | 停止 + 削除 (volume 保持) |
| `make logs` | ログ追跡 |
| `make psql` | DB に psql で接続 |
| `make backend-test` | Testcontainers で統合テスト |
| `make frontend-build` | 型チェック + ビルド |
| `make nuke` | volume ごと全削除 (DB 消滅) |

## 環境 (DEV / STG / PRD)

`.env` ファイルで 3 つの環境を切り替えられる。

| 環境 | env ファイル | Make ターゲット | Spring プロファイル |
|------|--------------|-----------------|---------------------|
| DEV (local) | `.env.dev` (← `.env.dev.example`) | `make up-dev` / `up-dev-d` | `dev` |
| STG         | `.env.stg` (← `.env.stg.example`) | `make up-stg` / `up-stg-d` | `stg` |
| PRD         | `.env.prd` (← `.env.prd.example`) | `make up-prd` / `up-prd-d` | `prd` |

- `APP_ENV` が backend の `SPRING_PROFILES_ACTIVE` と frontend の `APP_ENV` / `NEXT_PUBLIC_APP_ENV` に伝搬する。
- `make up` / `make down` は DEV のエイリアス (後方互換)。
- 各 `make up-<env>` は `docker compose --env-file .env.<env>` を呼び出す。
- `.env.dev` / `.env.stg` / `.env.prd` は `.gitignore` 済み。`*.example` テンプレートのみ追跡。
- Backend の環境別設定は `backend/src/main/resources/application-{dev,stg,prd}.yml` を参照。

STG/PRD では以下が強制される:

- `COOKIE_INSECURE` フラグは無視され、セッション Cookie は常に `Secure`。
- `APP_JWT_SECRET` 未設定時は middleware が fail-closed で `/login` にリダイレクト。
- actuator は `/health` のみ。エラーレスポンスにメッセージ / スタックを含めない。

## 個別開発

### Backend

```bash
cd backend
./gradlew bootRun
./gradlew test
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## 品質ゲート

| 対象 | ツール | 実行 |
|------|--------|------|
| Backend Lint/Format | Spotless + google-java-format | `make backend-fmt` / `make backend-lint` |
| Backend Test | JUnit 5 + Testcontainers | `make backend-test` |
| Backend Coverage | JaCoCo (60% 下限) | `./gradlew check` |
| Frontend Lint | ESLint flat config (next/core-web-vitals + next/typescript + prettier) | `make frontend-lint` |
| Frontend Format | Prettier + prettier-plugin-tailwindcss | `make frontend-fmt` |
| Frontend Test | Vitest | `make frontend-test` |
| Frontend Type | tsc --noEmit | `cd frontend && pnpm typecheck` |
| 全体 | 一括 | `make check` |

## CI/CD (GitHub Actions)

`.github/workflows/` に 4 ワークフロー:

| Workflow | Trigger | 内容 |
|----------|---------|------|
| `backend-ci.yml` | push/PR (backend/**) | Spotless → Test → JaCoCo → レポートアーティファクト |
| `frontend-ci.yml` | push/PR (frontend/**) | Prettier → ESLint → typecheck → Vitest → Build |
| `docker-build.yml` | push main / tag / Dockerfile 変更 | Backend/Frontend イメージを matrix ビルドし `ghcr.io` へ push (PR は push せず検証のみ) |
| `e2e.yml` | push main / 手動 | docker compose up → API スモーク (register + todo 作成) |

## API

| Method | Path | 認証 |
|--------|------|------|
| POST | /api/auth/register | - |
| POST | /api/auth/login | - |
| GET | /api/auth/me | JWT |
| GET | /api/todos | JWT |
| POST | /api/todos | JWT |
| PATCH | /api/todos/{id} | JWT |
| DELETE | /api/todos/{id} | JWT |
