# Task-002: CI/CDパイプライン構築

## フェーズ
Phase 01 - プロジェクト基盤

## 概要
GitHub Actions で CI（lint/test/build）と GitHub Pages デプロイを設定する。

## 作業内容

### 1. CI ワークフロー (`.github/workflows/ci.yml`)
- トリガ: push / pull_request
- ステップ:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (node 20, cache npm)
  3. `npm ci`
  4. `npm run lint`
  5. `npm run test -- --run`
  6. `npm run build`

### 2. デプロイワークフロー (`.github/workflows/deploy.yml`)
- トリガ: main branch push + workflow_dispatch
- 仕様書§14.2 の構成に準拠
- permissions: contents read, pages write, id-token write
- concurrency: pages グループ
- ステップ:
  1. checkout → setup-node → npm ci → lint → test → build
  2. `actions/configure-pages@v5`
  3. `actions/upload-pages-artifact@v3` (path: dist)
  4. `actions/deploy-pages@v4`

## 依存
- task-001（プロジェクト初期セットアップ）

## 完了条件
- CI が push/PR で自動実行される
- main push で GitHub Pages にデプロイされる
- ワークフローファイルが仕様書§14 に準拠
