# TODO アプリ (Next.js + Spring Boot + PostgreSQL)

マルチユーザ対応の TODO 管理 Web アプリ。

## スタック

- Frontend: Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- Backend: Spring Boot 3.5 (Java 21) + Spring Security + JWT + JPA + Flyway
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
